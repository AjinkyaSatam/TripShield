import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildItineraryGraph } from '@/lib/graph/builder';
import { analyzeImpact } from '@/lib/graph/impact';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const disruptionEvent = await prisma.disruptionEvent.findUnique({
      where: { id },
      include: {
        trip: true,
        booking: true,
      },
    });

    if (!disruptionEvent) {
      return NextResponse.json(
        { success: false, error: 'Disruption event not found' },
        { status: 404 }
      );
    }

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

    return NextResponse.json({
      success: true,
      disruptionEvent,
      impact,
    });
  } catch (error: any) {
    console.error('Error fetching disruption impact:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch disruption impact' },
      { status: 500 }
    );
  }
}
