import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildItineraryGraph } from '@/lib/graph/builder';
import { analyzeImpact } from '@/lib/graph/impact';
import { generateCandidateOptions } from '@/lib/recovery/ruleEngine';
import { rankAndExplainRecoveryPlans } from '@/lib/ai/claude';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: disruptionEventId } = await params;

    const disruptionEvent = await prisma.disruptionEvent.findUnique({
      where: { id: disruptionEventId },
      include: {
        trip: true,
        booking: true,
        recoveryPlans: {
          include: {
            options: {
              orderBy: { rank: 'asc' },
            },
          },
        },
      },
    });

    if (!disruptionEvent) {
      return NextResponse.json(
        { success: false, error: 'Disruption event not found' },
        { status: 404 }
      );
    }

    // If an active recovery plan already exists in DB, return it immediately for instant response
    const existingPlan = disruptionEvent.recoveryPlans[0];
    if (existingPlan && existingPlan.options.length > 0) {
      return NextResponse.json({
        success: true,
        plan: {
          id: existingPlan.id,
          disruptionEventId: existingPlan.disruptionEventId,
          generatedAt: existingPlan.generatedAt,
          status: existingPlan.status,
          options: existingPlan.options.map((opt) => ({
            ...opt,
            actions: JSON.parse(opt.actions || '[]'),
          })),
        },
      });
    }

    // Otherwise, generate a fresh plan
    const bookings = await prisma.booking.findMany({
      where: { tripId: disruptionEvent.tripId },
      orderBy: { startTime: 'asc' },
    });

    const links = await prisma.bookingLink.findMany({
      where: {
        fromBooking: { tripId: disruptionEvent.tripId },
      },
    });

    const graph = buildItineraryGraph(disruptionEvent.tripId, bookings, links);

    const impact = analyzeImpact(graph, {
      disruptedBookingId: disruptionEvent.bookingId,
      disruptionType: disruptionEvent.type as any,
      delayMinutes: disruptionEvent.delayMinutes || 120,
      reason: disruptionEvent.reason,
      disruptionId: disruptionEvent.id,
    });

    // Stage A: Candidate generation & scoring
    const candidates = await generateCandidateOptions({ graph, impact });

    // Stage B: AI ranking & traveler rationale (with resilient 3s fallback)
    const generatedPlan = await rankAndExplainRecoveryPlans({
      graph,
      impact,
      candidates,
      tripName: disruptionEvent.trip.name,
    });

    // Save RecoveryPlan in DB
    const plan = await prisma.recoveryPlan.create({
      data: {
        disruptionEventId: disruptionEvent.id,
        status: 'generated',
      },
    });

    // Save RecoveryOptions in DB
    const savedOptions = [];
    for (const opt of generatedPlan.options) {
      const savedOption = await prisma.recoveryOption.create({
        data: {
          planId: plan.id,
          rank: opt.rank,
          title: opt.title,
          description: opt.description,
          totalCost: opt.totalCost,
          costDelta: opt.costDelta,
          timeDelta: opt.timeDelta,
          convenienceScore: opt.convenienceScore,
          itineraryDisruptionPct: opt.itineraryDisruptionPct,
          actions: JSON.stringify(opt.actions),
          rationale: opt.rationale,
          caveats: opt.caveats,
        },
      });
      savedOptions.push({
        ...savedOption,
        actions: opt.actions,
      });
    }

    return NextResponse.json({
      success: true,
      source: generatedPlan.source,
      plan: {
        id: plan.id,
        disruptionEventId: plan.disruptionEventId,
        generatedAt: plan.generatedAt,
        status: plan.status,
        options: savedOptions,
      },
    });
  } catch (error: any) {
    console.error('Error generating recovery plans:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate recovery plans' },
      { status: 500 }
    );
  }
}
