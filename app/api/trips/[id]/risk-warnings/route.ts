import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildItineraryGraph } from '@/lib/graph/builder';
import { scanProactiveRisks } from '@/lib/graph/riskScan';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;

    const bookings = await prisma.booking.findMany({
      where: { tripId },
      orderBy: { startTime: 'asc' },
    });

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No bookings found for this trip' },
        { status: 404 }
      );
    }

    const links = await prisma.bookingLink.findMany({
      where: { fromBooking: { tripId } },
    });

    const graph = buildItineraryGraph(tripId, bookings, links);
    const proactiveRisks = scanProactiveRisks(graph);

    return NextResponse.json({
      success: true,
      tripId,
      proactiveRisks,
      totalRisks: proactiveRisks.length,
    });
  } catch (error: any) {
    console.error('Error fetching risk warnings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch risk warnings' },
      { status: 500 }
    );
  }
}
