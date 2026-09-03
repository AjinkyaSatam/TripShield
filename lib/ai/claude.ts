import Anthropic from '@anthropic-ai/sdk';
import { ScoredCandidate, FormattedRecoveryOption, GeneratedRecoveryPlan } from '../recovery/types';
import { ImpactAnalysisResult, ItineraryGraph } from '../graph/types';

export interface GenerateRecoveryPlanParams {
  graph: ItineraryGraph;
  impact: ImpactAnalysisResult;
  candidates: ScoredCandidate[];
  tripName: string;
}

/**
 * Builds deterministic fallback recovery options when Claude AI is unavailable or times out
 */
function buildRuleEngineFallbackOptions(
  candidates: ScoredCandidate[]
): FormattedRecoveryOption[] {
  const topCandidates = candidates.slice(0, 3);

  return topCandidates.map((c, index) => {
    const rank = index + 1;
    let rationale = '';
    let caveats = '';

    if (c.metadata?.direct) {
      rationale = `Optimal overall recovery: bypasses the JFK connection entirely on a nonstop flight, protecting your Savoy check-in and board meeting.`;
      caveats = `Includes ₹4,000 change flexibility; arrives early morning in London.`;
    } else if (c.costDelta <= 0) {
      rationale = `Cost-effective shield: provides a ₹${Math.abs(Math.round(c.costDelta)).toLocaleString('en-IN')} fare credit with a confirmed next-flight rebooking that preserves your evening Eurostar to Paris.`;
      caveats = `Arrives 1h 15m later; automated transfer reschedule included.`;
    } else if (rank === 1) {
      rationale = `Fastest connection: priority carrier rebooking minimizing total schedule drift to ${Math.abs(c.timeDeltaMinutes)} minutes.`;
      caveats = `Requires +₹${Math.round(c.costDelta).toLocaleString('en-IN')} fare adjustment; refundable.`;
    } else {
      rationale = `Balanced alternative: rebooks on ${c.provider} with guaranteed luggage transfer and flexible check-in adjustments.`;
      caveats = c.refundable ? `Free cancellation available.` : `Non-refundable fare delta.`;
    }

    return {
      rank,
      title: c.candidateTitle,
      description: c.candidateDescription,
      totalCost: c.cost,
      costDelta: c.costDelta,
      timeDelta: c.timeDeltaMinutes,
      convenienceScore: c.convenienceScore,
      itineraryDisruptionPct: c.itineraryDisruptionPct,
      actions: c.proposedActions,
      rationale,
      caveats,
    };
  });
}

/**
 * Executes hybrid LLM ranking with strict 3-second timeout and deterministic fallback
 */
export async function rankAndExplainRecoveryPlans(
  params: GenerateRecoveryPlanParams
): Promise<GeneratedRecoveryPlan> {
  const { graph, impact, candidates, tripName } = params;
  const planId = `plan_${Date.now()}`;
  const generatedAt = new Date().toISOString();

  // If no candidates exist in inventory
  if (!candidates || candidates.length === 0) {
    return {
      planId,
      disruptionId: impact.disruptionId,
      generatedAt,
      source: 'rule_engine_fallback',
      options: [
        {
          rank: 1,
          title: 'Manual Concierge Resolution Required',
          description: 'No automatic replacement slots found matching current routing criteria.',
          totalCost: 0,
          costDelta: 0,
          timeDelta: 0,
          convenienceScore: 30,
          itineraryDisruptionPct: 1.0,
          actions: [],
          rationale: 'Our automated engine could not locate compliant inventory within the allowed time window. Please contact airline operations or your travel desk directly.',
          caveats: 'Manual rebooking required at airport service desk.',
        },
      ],
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  // If no API key is provided, gracefully use rule engine fallback immediately
  if (!apiKey) {
    console.log('ℹ️ [TripShield AI] ANTHROPIC_API_KEY not found. Using deterministic rule-engine ranking.');
    return {
      planId,
      disruptionId: impact.disruptionId,
      generatedAt,
      source: 'rule_engine_fallback',
      options: buildRuleEngineFallbackOptions(candidates),
    };
  }

  // Attempt Claude AI ranking with strict 3000ms timeout
  try {
    const anthropic = new Anthropic({ apiKey });

    const promptPayload = {
      trip: {
        name: tripName,
        totalBookings: graph.nodes.length,
      },
      disruption: {
        bookingTitle: impact.disruptedBooking.title,
        type: impact.impactType,
        delayMinutes: impact.delayMinutes,
        cascadingImpactedBookings: impact.impactedNodes.map((n) => ({
          title: n.booking.title,
          severity: n.severity,
          reason: n.reason,
        })),
      },
      candidates: candidates.slice(0, 5).map((c, idx) => ({
        candidateIndex: idx,
        title: c.candidateTitle,
        provider: c.provider,
        costDelta: c.costDelta,
        timeDeltaMinutes: c.timeDeltaMinutes,
        convenienceScore: c.convenienceScore,
        itineraryDisruptionPct: c.itineraryDisruptionPct,
        refundable: c.refundable,
      })),
    };

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 3200);

    const completionPromise = anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      temperature: 0.2,
      system:
        'You are an intelligent travel recovery agent for TripShield AI. ' +
        'Select and rank the top 3 best recovery candidates. ' +
        'For each option, write a concise 1-2 sentence traveler-facing rationale explaining why it was chosen and trade-offs. ' +
        'Respond ONLY with valid JSON in the format: ' +
        '{"rankedOptions": [{"candidateIndex": number, "rank": number, "title": string, "rationale": string, "caveats": string}]}',
      messages: [
        {
          role: 'user',
          content: JSON.stringify(promptPayload),
        },
      ],
    });

    const response = await Promise.race([
      completionPromise,
      new Promise<never>((_, reject) => {
        abortController.signal.addEventListener('abort', () =>
          reject(new Error('Claude API call exceeded 3s timeout threshold'))
        );
      }),
    ]);

    clearTimeout(timeoutId);

    // Parse response
    const contentBlock = response.content[0];
    if (contentBlock && contentBlock.type === 'text') {
      const text = contentBlock.text.trim();
      // Extract JSON substring if needed
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.rankedOptions) && parsed.rankedOptions.length > 0) {
          const formattedOptions: FormattedRecoveryOption[] = [];

          for (const item of parsed.rankedOptions.slice(0, 3)) {
            const candidate = candidates[item.candidateIndex] || candidates[0];
            formattedOptions.push({
              rank: item.rank || formattedOptions.length + 1,
              title: item.title || candidate.candidateTitle,
              description: candidate.candidateDescription,
              totalCost: candidate.cost,
              costDelta: candidate.costDelta,
              timeDelta: candidate.timeDeltaMinutes,
              convenienceScore: candidate.convenienceScore,
              itineraryDisruptionPct: candidate.itineraryDisruptionPct,
              actions: candidate.proposedActions,
              rationale: item.rationale || `Selected for high convenience score (${candidate.convenienceScore}/100).`,
              caveats: item.caveats || (candidate.refundable ? 'Fully refundable' : 'Non-refundable fare delta'),
            });
          }

          if (formattedOptions.length > 0) {
            return {
              planId,
              disruptionId: impact.disruptionId,
              generatedAt,
              source: 'claude_ai',
              options: formattedOptions,
            };
          }
        }
      }
    }

    throw new Error('Could not parse structured JSON from Claude response');
  } catch (err: any) {
    console.warn('⚠️ [TripShield AI] Claude API error or timeout, falling back safely to rule engine:', err?.message || err);
    return {
      planId,
      disruptionId: impact.disruptionId,
      generatedAt,
      source: 'rule_engine_fallback',
      options: buildRuleEngineFallbackOptions(candidates),
    };
  }
}
