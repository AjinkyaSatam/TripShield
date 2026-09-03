import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildItineraryGraph } from '@/lib/graph/builder';
import { analyzeImpact } from '@/lib/graph/impact';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      bookingId,
      tripId: reqTripId,
      type = 'delay',
      delayMinutes = 120,
      reason = 'Severe ground stop and air traffic control hold',
    } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId is required' },
        { status: 400 }
      );
    }

    // Find the target booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Target booking not found' },
        { status: 404 }
      );
    }

    const tripId = reqTripId || booking.tripId;

    // Fetch all bookings and links for this trip
    const bookings = await prisma.booking.findMany({
      where: { tripId },
      orderBy: { startTime: 'asc' },
    });

    const links = await prisma.bookingLink.findMany({
      where: {
        fromBooking: { tripId },
      },
    });

    // Build graph and run impact analysis
    const graph = buildItineraryGraph(tripId, bookings, links);

    const impact = analyzeImpact(graph, {
      disruptedBookingId: bookingId,
      disruptionType: type,
      delayMinutes: Number(delayMinutes),
      reason,
    });

    // Persist DisruptionEvent in DB
    const disruptionEvent = await prisma.disruptionEvent.create({
      data: {
        tripId,
        bookingId,
        type,
        delayMinutes: type === 'delay' ? Number(delayMinutes) : null,
        reason,
        status: 'active',
      },
    });

    // Update statuses of affected bookings in database
    // Mark root disrupted booking as 'disrupted'
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'disrupted' },
    });

    // Mark downstream impacted bookings as 'disrupted' or 'at_risk'
    for (const impacted of impact.impactedNodes) {
      await prisma.booking.update({
        where: { id: impacted.bookingId },
        data: { status: impacted.severity },
      });
    }

    return NextResponse.json({
      success: true,
      disruptionEvent,
      impact: {
        ...impact,
        disruptionId: disruptionEvent.id,
      },
    });
  } catch (error: any) {
    console.error('Error simulating disruption:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to simulate disruption' },
      { status: 500 }
    );
  }
}
