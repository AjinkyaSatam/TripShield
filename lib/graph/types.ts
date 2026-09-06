export type BookingType = 'FLIGHT' | 'HOTEL' | 'TRANSFER' | 'ACTIVITY' | 'EVENT';
export type BookingStatus = 'confirmed' | 'at_risk' | 'disrupted' | 'cancelled' | 'rebooked';
export type RelationType = 'connects_to' | 'requires_checkin_before' | 'same_day' | 'transfer_needed';

export interface BookingDetails {
  flightNumber?: string;
  aircraft?: string;
  seat?: string;
  origin?: string;
  destination?: string;
  terminal?: string;
  service?: string;
  pickup?: string;
  dropoff?: string;
  roomType?: string;
  address?: string;
  venue?: string;
  agenda?: string;
  experience?: string;
  trainNumber?: string;
  coach?: string;
  [key: string]: unknown;
}

export interface GraphNode {
  id: string;
  tripId: string;
  type: BookingType | string;
  provider: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  status: BookingStatus | string;
  cost: number;
  cancellationPolicy: string;
  refundable: boolean;
  details?: BookingDetails | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GraphEdge {
  id: string;
  fromBookingId: string;
  toBookingId: string;
  relationType: RelationType | string;
  bufferMinutes: number;
  minRequiredBufferMinutes: number;
  headroomMinutes?: number; // bufferMinutes - minRequiredBufferMinutes
}

export interface ItineraryGraph {
  tripId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacencyList: Record<string, GraphEdge[]>; // fromNodeId -> outgoing edges
  incomingAdjacencyList: Record<string, GraphEdge[]>; // toNodeId -> incoming edges
}

export interface ImpactedNode {
  bookingId: string;
  booking: GraphNode;
  severity: 'disrupted' | 'at_risk';
  reason: string;
  violatedEdge?: GraphEdge;
  propagatedDelayMinutes: number;
  originalBufferMinutes?: number;
  newBufferMinutes?: number;
  minRequiredBufferMinutes?: number;
}

export interface ImpactAnalysisResult {
  disruptionId: string;
  disruptedBookingId: string;
  disruptedBooking: GraphNode;
  impactType: 'delay' | 'cancellation' | 'overbooking' | 'weather';
  delayMinutes: number;
  reason?: string;
  impactedNodes: ImpactedNode[];
  totalAffectedBookings: number;
  timestamp: string;
}

export interface RiskWarning {
  id: string;
  edgeId: string;
  fromBooking: GraphNode;
  toBooking: GraphNode;
  bufferMinutes: number;
  minRequiredBufferMinutes: number;
  headroomMinutes: number;
  severity: 'high' | 'medium';
  message: string;
  recommendation: string;
}
