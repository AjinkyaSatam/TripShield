import { ItineraryGraph, ImpactedNode, ImpactAnalysisResult, GraphNode, GraphEdge } from './types';

export interface ImpactAnalysisOptions {
  disruptedBookingId: string;
  disruptionType: 'delay' | 'cancellation' | 'overbooking' | 'weather';
  delayMinutes?: number;
  reason?: string;
  disruptionId?: string;
}

/**
 * Generates an intuitive human-readable reason for why a downstream node is impacted
 */
function describeImpact(
  edge: GraphEdge,
  fromNode: GraphNode,
  toNode: GraphNode,
  newBuffer: number,
  isCancellation: boolean
): string {
  if (isCancellation) {
    return `Cancelled upstream leg (${fromNode.title}) leaves no transit to ${toNode.title}.`;
  }

  const deficit = edge.minRequiredBufferMinutes - newBuffer;

  switch (edge.relationType) {
    case 'connects_to':
      if (newBuffer < 0) {
        return `Missed connection: ${toNode.title} departs ${Math.abs(newBuffer)} min before delayed arrival (required layover: ${edge.minRequiredBufferMinutes} min).`;
      }
      return `Critically tight connection: layover squeezed to ${newBuffer} min (minimum required: ${edge.minRequiredBufferMinutes} min, ${deficit} min deficit).`;

    case 'transfer_needed':
      if (newBuffer < 0) {
        return `Missed transfer window: scheduled pickup for ${toNode.title} departs ${Math.abs(newBuffer)} min before arrival.`;
      }
      return `Tight transit window: airport to city buffer reduced to ${newBuffer} min (minimum required: ${edge.minRequiredBufferMinutes} min).`;

    case 'requires_checkin_before':
      return `Check-in delayed: arrival pushed back by ${deficit} min, conflicting with scheduled check-in window.`;

    case 'same_day':
    default:
      if (newBuffer < 0) {
        return `Schedule collision: delayed arrival overlaps with ${toNode.title} start time by ${Math.abs(newBuffer)} min.`;
      }
      return `Schedule conflict: transit buffer reduced to ${newBuffer} min (minimum required: ${edge.minRequiredBufferMinutes} min).`;
  }
}

/**
 * Executes BFS cascade impact analysis following 5_Backend_Flow.md §3
 */
export function analyzeImpact(
  graph: ItineraryGraph,
  options: ImpactAnalysisOptions
): ImpactAnalysisResult {
  const {
    disruptedBookingId,
    disruptionType,
    delayMinutes = 120,
    reason = 'Unscheduled delay',
    disruptionId = `disp_${Date.now()}`,
  } = options;

  const nodeMap = new Map<string, GraphNode>();
  graph.nodes.forEach((n) => nodeMap.set(n.id, n));

  const rootNode = nodeMap.get(disruptedBookingId);
  if (!rootNode) {
    throw new Error(`Booking ${disruptedBookingId} not found in itinerary graph.`);
  }

  const isCancellation = disruptionType === 'cancellation';
  const effectiveDelta = isCancellation ? 999999 : delayMinutes;

  // BFS Queue stores [bookingId, currentCumulativeDelay]
  const queue: Array<{ bookingId: string; delta: number }> = [
    { bookingId: disruptedBookingId, delta: effectiveDelta },
  ];

  const visited = new Set<string>();
  visited.add(disruptedBookingId);

  const impactedNodes: ImpactedNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentNode = nodeMap.get(current.bookingId);
    if (!currentNode) continue;

    const outgoingEdges = graph.adjacencyList[current.bookingId] || [];

    for (const edge of outgoingEdges) {
      const targetNode = nodeMap.get(edge.toBookingId);
      if (!targetNode) continue;

      // Calculate new available buffer after upstream delay
      const newBuffer = edge.bufferMinutes - current.delta;

      // If available buffer drops below minimum required threshold
      if (newBuffer < edge.minRequiredBufferMinutes) {
        const isDisrupted = isCancellation || newBuffer < 0 || newBuffer < (edge.minRequiredBufferMinutes * 0.3);
        const severity: 'disrupted' | 'at_risk' = isDisrupted ? 'disrupted' : 'at_risk';

        const impactReason = describeImpact(
          edge,
          currentNode,
          targetNode,
          newBuffer,
          isCancellation
        );

        // Calculate how much downstream arrival shifts
        // If buffer was absorbed partially, downstream delay = max(0, edge.minRequiredBufferMinutes - newBuffer)
        const downstreamDelay = isCancellation
          ? 999999
          : Math.max(0, edge.minRequiredBufferMinutes - newBuffer);

        if (!visited.has(edge.toBookingId)) {
          visited.add(edge.toBookingId);

          impactedNodes.push({
            bookingId: targetNode.id,
            booking: targetNode,
            severity,
            reason: impactReason,
            violatedEdge: edge,
            propagatedDelayMinutes: downstreamDelay,
            originalBufferMinutes: edge.bufferMinutes,
            newBufferMinutes: newBuffer,
            minRequiredBufferMinutes: edge.minRequiredBufferMinutes,
          });

          // Cascade further downstream if this node causes downstream ripples
          if (downstreamDelay > 0) {
            queue.push({
              bookingId: targetNode.id,
              delta: downstreamDelay,
            });
          }
        }
      }
    }
  }

  return {
    disruptionId,
    disruptedBookingId,
    disruptedBooking: rootNode,
    impactType: disruptionType,
    delayMinutes,
    impactedNodes,
    totalAffectedBookings: impactedNodes.length + 1, // root + impacted
    timestamp: new Date().toISOString(),
  };
}
