import { ItineraryGraph, RiskWarning, GraphNode } from './types';

export interface RiskScanOptions {
  riskThresholdMinutes?: number; // Headroom threshold (default 20 min)
}

/**
 * Scans itinerary graph edges for tight buffers below headroom thresholds per 5_Backend_Flow.md §6
 */
export function scanProactiveRisks(
  graph: ItineraryGraph,
  options: RiskScanOptions = {}
): RiskWarning[] {
  const { riskThresholdMinutes = 20 } = options;
  const nodeMap = new Map<string, GraphNode>();
  graph.nodes.forEach((n) => nodeMap.set(n.id, n));

  const warnings: RiskWarning[] = [];

  for (const edge of graph.edges) {
    const fromNode = nodeMap.get(edge.fromBookingId);
    const toNode = nodeMap.get(edge.toBookingId);

    if (!fromNode || !toNode) continue;

    // Headroom is available slack minus the minimum required threshold
    const headroom = edge.bufferMinutes - edge.minRequiredBufferMinutes;

    if (headroom <= riskThresholdMinutes) {
      const severity: 'high' | 'medium' = headroom <= 15 ? 'high' : 'medium';

      let message = '';
      let recommendation = '';

      if (edge.relationType === 'connects_to') {
        message = `Critically tight connection: only ${headroom} min headroom between ${fromNode.title} and ${toNode.title}.`;
        recommendation = `International transfer requires 90 min; current slack is ${edge.bufferMinutes} min. Fast-track security lane recommended.`;
      } else if (edge.relationType === 'transfer_needed') {
        message = `Tight transfer window: ${headroom} min buffer margin between airport arrival and ${toNode.title}.`;
        recommendation = `Customs or baggage delay may exceed scheduled transfer departure. Advise private chauffeur standby.`;
      } else if (edge.relationType === 'requires_checkin_before') {
        message = `Strict check-in buffer: only ${headroom} min before ${toNode.title} check-in cutoff.`;
        recommendation = `Notify hotel front desk of estimated arrival to prevent room release.`;
      } else {
        message = `Compressed schedule window: ${headroom} min slack between ${fromNode.title} and ${toNode.title}.`;
        recommendation = `Review urban transit route to mitigate street traffic delays.`;
      }

      warnings.push({
        id: `risk_${edge.id}`,
        edgeId: edge.id,
        fromBooking: fromNode,
        toBooking: toNode,
        bufferMinutes: edge.bufferMinutes,
        minRequiredBufferMinutes: edge.minRequiredBufferMinutes,
        headroomMinutes: headroom,
        severity,
        message,
        recommendation,
      });
    }
  }

  // Sort with highest risk first (smallest headroom)
  return warnings.sort((a, b) => a.headroomMinutes - b.headroomMinutes);
}
