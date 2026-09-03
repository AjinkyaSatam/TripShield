import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildItineraryGraph } from '@/lib/graph/builder';
import { scanProactiveRisks } from '@/lib/graph/riskScan';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { startTime: 'asc' },
        },
        disruptions: {
          orderBy: { timestamp: 'desc' },
          include: {
            recoveryPlans: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { success: false, error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Fetch all links belonging to this trip's bookings
    const bookingIds = trip.bookings.map((b) => b.id);
    const links = await prisma.bookingLink.findMany({
      where: {
        fromBookingId: { in: bookingIds },
        toBookingId: { in: bookingIds },
      },
    });

    // Build graph structure and scan proactive risks
    const graph = buildItineraryGraph(trip.id, trip.bookings, links);
    const proactiveRisks = scanProactiveRisks(graph);

    return NextResponse.json({
      success: true,
      trip,
      graph: {
        nodes: graph.nodes,
        edges: graph.edges,
      },
      proactiveRisks,
    });
  } catch (error: any) {
    console.error('Error fetching trip details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}
