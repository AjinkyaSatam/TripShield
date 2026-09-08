import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildItineraryGraph, autoInferLinks, validateDAG } from '@/lib/graph/builder';
import { scanProactiveRisks } from '@/lib/graph/riskScan';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;
    const body = await req.json();

    const {
      type,
      provider,
      title,
      startTime,
      endTime,
      location,
      cost,
      cancellationPolicy = 'Flexible cancellation up to 24h before',
      refundable = true,
      details,
    } = body;

    if (!type || !provider || !title || !startTime || !endTime || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields (type, provider, title, startTime, endTime, location)' },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { bookings: true },
    });

    if (!trip) {
      return NextResponse.json(
        { success: false, error: 'Trip not found' },
        { status: 404 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return NextResponse.json(
        { success: false, error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // 1. Create the new booking
    const newBooking = await prisma.booking.create({
      data: {
        tripId,
        type: type.toUpperCase(),
        provider,
        title,
        startTime: start,
        endTime: end,
        location,
        cost: typeof cost === 'number' ? cost : parseFloat(cost) || 0,
        cancellationPolicy,
        refundable: Boolean(refundable),
        details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
        status: 'confirmed',
      },
    });

    // 2. Fetch all bookings for the trip ordered by startTime
    const allBookings = await prisma.booking.findMany({
      where: { tripId },
      orderBy: { startTime: 'asc' },
    });

    // 3. Clear old links for this trip and auto-infer new edges
    const bookingIds = allBookings.map((b) => b.id);
    await prisma.bookingLink.deleteMany({
      where: {
        OR: [
          { fromBookingId: { in: bookingIds } },
          { toBookingId: { in: bookingIds } },
        ],
      },
    });

    const inferredLinks = autoInferLinks(allBookings);

    if (inferredLinks.length > 0) {
      await prisma.bookingLink.createMany({
        data: inferredLinks,
      });
    }

    // 4. Retrieve newly created links
    const links = await prisma.bookingLink.findMany({
      where: {
        fromBookingId: { in: bookingIds },
        toBookingId: { in: bookingIds },
      },
    });

    // 5. Build and validate DAG
    const graph = buildItineraryGraph(tripId, allBookings, links);
    const dagCheck = validateDAG(graph.nodes, graph.edges);
    const proactiveRisks = scanProactiveRisks(graph);

    return NextResponse.json({
      success: true,
      booking: newBooking,
      isDAG: dagCheck.isDAG,
      cycleNodeIds: dagCheck.cycleNodeIds || [],
      graph: {
        nodes: graph.nodes,
        edges: graph.edges,
      },
      proactiveRisks,
      message: `Booking "${newBooking.title}" inserted. Auto-inferred ${inferredLinks.length} graph dependency edges.`,
    });
  } catch (error: any) {
    console.error('Error adding booking node:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add booking node' },
      { status: 500 }
    );
  }
}
