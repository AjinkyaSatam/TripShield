import { Booking, BookingLink } from '@prisma/client';
import {
  GraphNode,
  GraphEdge,
  ItineraryGraph,
  RelationType,
  BookingDetails,
} from './types';

export function parseBookingDetails(rawDetails?: string | null): BookingDetails | null {
  if (!rawDetails) return null;
  try {
    return JSON.parse(rawDetails) as BookingDetails;
  } catch {
    return null;
  }
}

export function toGraphNode(booking: Booking): GraphNode {
  return {
    id: booking.id,
    tripId: booking.tripId,
    type: booking.type,
    provider: booking.provider,
    title: booking.title,
    startTime: new Date(booking.startTime),
    endTime: new Date(booking.endTime),
    location: booking.location,
    status: booking.status,
    cost: booking.cost,
    cancellationPolicy: booking.cancellationPolicy,
    refundable: booking.refundable,
    details: parseBookingDetails(booking.details),
    createdAt: new Date(booking.createdAt),
    updatedAt: new Date(booking.updatedAt),
  };
}

export function toGraphEdge(link: BookingLink): GraphEdge {
  const headroom = link.bufferMinutes - link.minRequiredBufferMinutes;
  return {
    id: link.id,
    fromBookingId: link.fromBookingId,
    toBookingId: link.toBookingId,
    relationType: link.relationType,
    bufferMinutes: link.bufferMinutes,
    minRequiredBufferMinutes: link.minRequiredBufferMinutes,
    headroomMinutes: headroom,
  };
}

export function buildItineraryGraph(
  tripId: string,
  bookings: Booking[],
  links: BookingLink[]
): ItineraryGraph {
  const nodes: GraphNode[] = bookings.map(toGraphNode);
  const edges: GraphEdge[] = links.map(toGraphEdge);

  const adjacencyList: Record<string, GraphEdge[]> = {};
  const incomingAdjacencyList: Record<string, GraphEdge[]> = {};

  nodes.forEach((node) => {
    adjacencyList[node.id] = [];
    incomingAdjacencyList[node.id] = [];
  });

  edges.forEach((edge) => {
    if (adjacencyList[edge.fromBookingId]) {
      adjacencyList[edge.fromBookingId].push(edge);
    }
    if (incomingAdjacencyList[edge.toBookingId]) {
      incomingAdjacencyList[edge.toBookingId].push(edge);
    }
  });

  return {
    tripId,
    nodes,
    edges,
    adjacencyList,
    incomingAdjacencyList,
  };
}

/**
 * Calculates buffer minutes between two consecutive bookings
 */
export function calculateBufferMinutes(fromEndTime: Date, toStartTime: Date): number {
  const diffMs = toStartTime.getTime() - fromEndTime.getTime();
  return Math.round(diffMs / (1000 * 60));
}

/**
 * Infers minimum required buffer based on connection type and location
 */
export function inferMinRequiredBuffer(
  fromType: string,
  toType: string,
  relationType: RelationType,
  fromLocation?: string,
  toLocation?: string
): number {
  if (relationType === 'connects_to') {
    // Check if international layover
    const isInternational =
      fromLocation?.includes('LHR') ||
      fromLocation?.includes('JFK') ||
      fromLocation?.includes('CDG') ||
      toLocation?.includes('LHR') ||
      toLocation?.includes('CDG') ||
      toLocation?.includes('Paris') ||
      toLocation?.includes('London');

    return isInternational ? 90 : 45;
  }

  if (relationType === 'transfer_needed') {
    return 45; // Baggage claim, customs, platform transit
  }

  if (relationType === 'requires_checkin_before') {
    return 30; // Hotel check-in / room settlement
  }

  // same_day sequential events
  return 30;
}

/**
 * Automatically infers logical dependency links between a list of bookings
 */
export function autoInferLinks(
  bookings: Array<{
    id: string;
    type: string;
    startTime: Date;
    endTime: Date;
    location: string;
  }>
): Array<{
  fromBookingId: string;
  toBookingId: string;
  relationType: RelationType;
  bufferMinutes: number;
  minRequiredBufferMinutes: number;
}> {
  const sorted = [...bookings].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
  const inferredLinks: Array<{
    fromBookingId: string;
    toBookingId: string;
    relationType: RelationType;
    bufferMinutes: number;
    minRequiredBufferMinutes: number;
  }> = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i];
    const to = sorted[i + 1];

    let relationType: RelationType = 'same_day';

    if (from.type === 'FLIGHT' && to.type === 'FLIGHT') {
      relationType = 'connects_to';
    } else if (from.type === 'FLIGHT' && to.type === 'TRANSFER') {
      relationType = 'transfer_needed';
    } else if (from.type === 'TRANSFER' && to.type === 'HOTEL') {
      relationType = 'requires_checkin_before';
    } else if (from.type === 'TRANSFER' && to.type === 'FLIGHT') {
      relationType = 'connects_to';
    } else if (to.type === 'HOTEL') {
      relationType = 'requires_checkin_before';
    }

    const bufferMinutes = calculateBufferMinutes(from.endTime, to.startTime);
    const minRequiredBufferMinutes = inferMinRequiredBuffer(
      from.type,
      to.type,
      relationType,
      from.location,
      to.location
    );

    inferredLinks.push({
      fromBookingId: from.id,
      toBookingId: to.id,
      relationType,
      bufferMinutes,
      minRequiredBufferMinutes,
    });
  }

  return inferredLinks;
}

/**
 * Validates that the graph is a Directed Acyclic Graph (no cyclical dependencies)
 */
export function validateDAG(
  nodes: GraphNode[],
  edges: GraphEdge[]
): { isDAG: boolean; cycleNodeIds?: string[] } {
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => {
    if (adj[e.fromBookingId]) {
      adj[e.fromBookingId].push(e.toBookingId);
    }
  });

  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};
  const cycle: string[] = [];

  function isCyclic(nodeId: string): boolean {
    visited[nodeId] = true;
    recStack[nodeId] = true;

    for (const neighborId of adj[nodeId] || []) {
      if (!visited[neighborId]) {
        if (isCyclic(neighborId)) {
          cycle.push(neighborId);
          return true;
        }
      } else if (recStack[neighborId]) {
        cycle.push(neighborId);
        return true;
      }
    }

    recStack[nodeId] = false;
    return false;
  }

  for (const node of nodes) {
    if (!visited[node.id]) {
      if (isCyclic(node.id)) {
        cycle.push(node.id);
        return { isDAG: false, cycleNodeIds: cycle.reverse() };
      }
    }
  }

  return { isDAG: true };
}
