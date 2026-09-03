import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildItineraryGraph, calculateBufferMinutes } from '@/lib/graph/builder';
import { scanProactiveRisks } from '@/lib/graph/riskScan';
import { RecoveryAction } from '@/lib/recovery/types';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const body = await req.json();
    const { optionId } = body;

    const plan = await prisma.recoveryPlan.findUnique({
      where: { id: planId },
      include: {
        disruptionEvent: {
          include: { trip: true },
        },
        options: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Recovery plan not found' },
        { status: 404 }
      );
    }

    // Select the chosen option
    const chosenOption = optionId
      ? plan.options.find((o) => o.id === optionId)
      : plan.options[0];

    if (!chosenOption) {
      return NextResponse.json(
        { success: false, error: 'Recovery option not found' },
        { status: 404 }
      );
    }

    const tripId = plan.disruptionEvent.tripId;
    const actions: RecoveryAction[] = JSON.parse(chosenOption.actions || '[]');
    const changedBookingsDiff: any[] = [];

    // Apply transactional updates
    await prisma.$transaction(async (tx) => {
      for (const action of actions) {
        const existing = await tx.booking.findUnique({
          where: { id: action.targetBookingId },
        });

        if (existing) {
          const updatedStartTime = action.newStartTime
            ? new Date(action.newStartTime)
            : existing.startTime;
          const updatedEndTime = action.newEndTime
            ? new Date(action.newEndTime)
            : existing.endTime;

          const updated = await tx.booking.update({
            where: { id: action.targetBookingId },
            data: {
              provider: action.newProvider || existing.provider,
              title: action.newTitle || existing.title,
              startTime: updatedStartTime,
              endTime: updatedEndTime,
              cost: action.newCost !== undefined ? action.newCost : existing.cost,
              status: 'rebooked',
            },
          });

          changedBookingsDiff.push({
            id: existing.id,
            title: existing.title,
            newTitle: updated.title,
            type: existing.type,
            previousStatus: existing.status,
            newStatus: 'rebooked',
            previousStartTime: existing.startTime,
            newStartTime: updated.startTime,
            costDelta: action.costDelta,
            reason: action.reason,
          });
        }
      }

      // Restore any remaining bookings that were marked at_risk to confirmed
      const affectedBookings = await tx.booking.findMany({
        where: {
          tripId,
          status: { in: ['at_risk', 'disrupted'] },
          id: { notIn: actions.map((a) => a.targetBookingId) },
        },
      });

      for (const b of affectedBookings) {
        await tx.booking.update({
          where: { id: b.id },
          data: { status: 'confirmed' },
        });
      }

      // Mark disruption event as resolved
      await tx.disruptionEvent.update({
        where: { id: plan.disruptionEventId },
        data: { status: 'resolved' },
      });

      // Mark recovery plan and option as applied
      await tx.recoveryPlan.update({
        where: { id: plan.id },
        data: { status: 'applied' },
      });

      await tx.recoveryOption.update({
        where: { id: chosenOption.id },
        data: { isApplied: true },
      });
    });

    // Recalculate edge buffer minutes for the entire trip graph
    const allBookings = await prisma.booking.findMany({
      where: { tripId },
      orderBy: { startTime: 'asc' },
    });

    const bookingMap = new Map(allBookings.map((b) => [b.id, b]));
    const links = await prisma.bookingLink.findMany({
      where: {
        fromBooking: { tripId },
      },
    });

    for (const link of links) {
      const from = bookingMap.get(link.fromBookingId);
      const to = bookingMap.get(link.toBookingId);
      if (from && to) {
        const newBuffer = calculateBufferMinutes(from.endTime, to.startTime);
        await prisma.bookingLink.update({
          where: { id: link.id },
          data: { bufferMinutes: newBuffer },
        });
      }
    }

    // Refresh updated links and build updated graph
    const updatedLinks = await prisma.bookingLink.findMany({
      where: { fromBooking: { tripId } },
    });

    const updatedGraph = buildItineraryGraph(tripId, allBookings, updatedLinks);
    const refreshedRisks = scanProactiveRisks(updatedGraph);

    const updatedTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        bookings: { orderBy: { startTime: 'asc' } },
        disruptions: { orderBy: { timestamp: 'desc' } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Recovery plan "${chosenOption.title}" successfully applied`,
      appliedOption: chosenOption,
      diff: {
        totalCostDelta: chosenOption.costDelta,
        timeDeltaMinutes: chosenOption.timeDelta,
        changedBookings: changedBookingsDiff,
      },
      updatedTrip,
      graph: {
        nodes: updatedGraph.nodes,
        edges: updatedGraph.edges,
      },
      proactiveRisks: refreshedRisks,
    });
  } catch (error: any) {
    console.error('Error applying recovery plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to apply recovery plan' },
      { status: 500 }
    );
  }
}
