export interface RecoveryAction {
  actionType: 'rebook' | 'shift' | 'cancel';
  targetBookingId: string;
  targetBookingTitle: string;
  targetType: string;
  newProvider?: string;
  newTitle?: string;
  newStartTime?: string;
  newEndTime?: string;
  newCost?: number;
  costDelta: number;
  reason: string;
}

export interface ScoredCandidate {
  inventoryItemId: string;
  category: string;
  provider: string;
  name: string;
  location: string;
  startTime: Date;
  endTime: Date;
  cost: number;
  cancellationPolicy: string;
  refundable: boolean;
  metadata?: any;
  costDelta: number;
  timeDeltaMinutes: number;
  itineraryDisruptionPct: number;
  convenienceScore: number;
  proposedActions: RecoveryAction[];
  candidateTitle: string;
  candidateDescription: string;
}

export interface FormattedRecoveryOption {
  id?: string;
  rank: number;
  title: string;
  description: string;
  totalCost: number;
  costDelta: number;
  timeDelta: number; // in minutes
  convenienceScore: number; // 0 to 100
  itineraryDisruptionPct: number; // 0.0 to 1.0
  actions: RecoveryAction[];
  rationale: string;
  caveats: string | null;
}

export interface GeneratedRecoveryPlan {
  id?: string;
  planId: string;
  disruptionId: string;
  generatedAt: string;
  status?: string;
  source?: 'claude_ai' | 'rule_engine_fallback' | string;
  options: FormattedRecoveryOption[];
}
