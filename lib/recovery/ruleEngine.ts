import { MockInventoryItem } from '@prisma/client';
import { prisma } from '../prisma';
import { GraphNode, ImpactAnalysisResult, ItineraryGraph } from '../graph/types';
import { ScoredCandidate, RecoveryAction } from './types';

export interface RuleEngineOptions {
  graph: ItineraryGraph;
  impact: ImpactAnalysisResult;
}

/**
 * Deterministic candidate generation and multi-objective scoring per 5_Backend_Flow.md §4 Stage A
 */
export async function generateCandidateOptions(
  options: RuleEngineOptions
): Promise<ScoredCandidate[]> {
  const { graph, impact } = options;
  const totalBookingsCount = graph.nodes.length || 1;

  // Determine which booking primarily requires rebooking/replacement
  // In the demo scenario: SFO->JFK is delayed by 120m, which breaks the JFK->LHR connection (Booking 2).
  // If the root node itself is cancelled, it is replaced; if it was delayed and caused a missed connection,
  // the missed connection (first severely disrupted downstream flight/transfer) is the primary target for rebooking!
  let targetNode: GraphNode = impact.disruptedBooking;

  const missedConnection = impact.impactedNodes.find(
    (n) => n.severity === 'disrupted' && (n.booking.type === 'FLIGHT' || n.booking.type === 'TRANSFER')
  );

  if (missedConnection && impact.impactType === 'delay') {
    targetNode = missedConnection.booking;
  }

  // Query mock inventory pool from database
  const inventoryItems = await prisma.mockInventoryItem.findMany({
    where: {
      category: targetNode.type,
    },
  });

  // If no exact category items found, query all mock inventory
  const candidatesPool = inventoryItems.length > 0
    ? inventoryItems
    : await prisma.mockInventoryItem.findMany();

  const scoredCandidates: ScoredCandidate[] = [];

  for (const item of candidatesPool) {
    let metadata: any = {};
    try {
      if (item.metadata) metadata = JSON.parse(item.metadata);
    } catch {
      metadata = {};
    }

    const itemStartTime = item.startTime ? new Date(item.startTime) : new Date(targetNode.startTime);
    const itemEndTime = item.endTime
      ? new Date(item.endTime)
      : new Date(itemStartTime.getTime() + (targetNode.endTime.getTime() - targetNode.startTime.getTime()));

    // Calculate cost delta vs original target booking
    const costDelta = Math.round((item.cost - targetNode.cost) * 100) / 100;

    // Calculate time delta in minutes
    const timeDeltaMinutes = Math.round(
      (itemStartTime.getTime() - targetNode.startTime.getTime()) / (1000 * 60)
    );

    // Estimate downstream disruption remaining
    // If candidate arrives within 2 hours of original, most downstream items are saved (only 1-2 affected)
    const arrivalShiftMinutes = Math.round(
      (itemEndTime.getTime() - targetNode.endTime.getTime()) / (1000 * 60)
    );

    let remainingAffectedCount = 0;
    if (metadata.direct) {
      // Direct flight bypasses JFK layover entirely, perfectly preserves London schedule!
      remainingAffectedCount = 0;
    } else if (arrivalShiftMinutes <= 90) {
      remainingAffectedCount = 1; // Only minor transfer shift
    } else if (arrivalShiftMinutes <= 180) {
      remainingAffectedCount = 2; // Transfer + hotel check-in shift
    } else {
      remainingAffectedCount = Math.min(impact.impactedNodes.length, 4);
    }

    const itineraryDisruptionPct = Math.round((remainingAffectedCount / totalBookingsCount) * 100) / 100;

    // Multi-objective convenience score (0 - 100)
    let score = 95;

    // Cost factor: penalize increases, slight reward for savings
    if (costDelta > 0) {
      score -= Math.min(30, (costDelta / 25));
    } else if (costDelta < 0) {
      score += Math.min(5, Math.abs(costDelta) / 25);
    }

    // Time factor: penalize significant schedule delays
    const absDelay = Math.abs(timeDeltaMinutes);
    score -= Math.min(30, absDelay / 20);

    // Disruption factor: heavy penalty if entire trip stays broken
    score -= itineraryDisruptionPct * 45;

    // Refundability / policy bonus
    if (item.refundable) score += 4;
    if (metadata.reliabilityScore && metadata.reliabilityScore > 90) score += 3;

    // Clamp score to clean 0-99 range
    const finalScore = Math.max(25, Math.min(98, Math.round(score)));

    // Synthesize concrete actions needed for this option
    const actions: RecoveryAction[] = [
      {
        actionType: 'rebook',
        targetBookingId: targetNode.id,
        targetBookingTitle: targetNode.title,
        targetType: targetNode.type,
        newProvider: item.provider,
        newTitle: item.name,
        newStartTime: itemStartTime.toISOString(),
        newEndTime: itemEndTime.toISOString(),
        newCost: item.cost,
        costDelta,
        reason: `Replaces ${targetNode.title} with ${item.name} to clear connection conflict.`,
      },
    ];

    // Check if secondary downstream adjustment is needed (e.g. Savoy check-in or transfer)
    if (remainingAffectedCount > 0) {
      const hotelNode = impact.impactedNodes.find((n) => n.booking.type === 'HOTEL');
      if (hotelNode) {
        actions.push({
          actionType: 'shift',
          targetBookingId: hotelNode.booking.id,
          targetBookingTitle: hotelNode.booking.title,
          targetType: 'HOTEL',
          newStartTime: new Date(hotelNode.booking.startTime.getTime() + 180 * 60000).toISOString(),
          newEndTime: hotelNode.booking.endTime.toISOString(),
          costDelta: 0,
          reason: 'Apply guaranteed late check-in hold (no fee).',
        });
      }

      const transferNode = impact.impactedNodes.find((n) => n.booking.type === 'TRANSFER');
      if (transferNode) {
        actions.push({
          actionType: 'shift',
          targetBookingId: transferNode.booking.id,
          targetBookingTitle: transferNode.booking.title,
          targetType: 'TRANSFER',
          newStartTime: new Date(itemEndTime.getTime() + 45 * 60000).toISOString(),
          newEndTime: new Date(itemEndTime.getTime() + 105 * 60000).toISOString(),
          costDelta: 0,
          reason: 'Auto-shift private transfer pickup to align with new flight arrival time.',
        });
      }
    }

    // Dynamic title & description
    let candidateTitle = item.name;
    let candidateDescription = `${item.provider} (${item.location})`;
    if (metadata.direct) {
      candidateTitle = `Direct Re-route: ${item.name}`;
      candidateDescription = `Nonstop flight bypassing the layover bottleneck entirely. Arrives on schedule.`;
    } else if (costDelta <= 0) {
      candidateTitle = `Budget Shield: ${item.name}`;
      candidateDescription = `Cost-neutral recovery saving ₹${Math.abs(Math.round(costDelta)).toLocaleString('en-IN')} with minimal schedule drift.`;
    } else {
      candidateTitle = `Fastest Connection: ${item.name}`;
      candidateDescription = `Priority rebooking maintaining your key London commitments.`;
    }

    scoredCandidates.push({
      inventoryItemId: item.id,
      category: item.category,
      provider: item.provider,
      name: item.name,
      location: item.location,
      startTime: itemStartTime,
      endTime: itemEndTime,
      cost: item.cost,
      cancellationPolicy: item.cancellationPolicy,
      refundable: item.refundable,
      metadata,
      costDelta,
      timeDeltaMinutes,
      itineraryDisruptionPct,
      convenienceScore: finalScore,
      proposedActions: actions,
      candidateTitle,
      candidateDescription,
    });
  }

  // Sort candidates by convenienceScore descending and keep top 4-6 candidates
  scoredCandidates.sort((a, b) => b.convenienceScore - a.convenienceScore);
  return scoredCandidates.slice(0, 5);
}
