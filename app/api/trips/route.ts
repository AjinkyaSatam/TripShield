import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { autoInferLinks } from '@/lib/graph/builder';

// GET /api/trips - List trips
export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        bookings: {
          orderBy: { startTime: 'asc' },
        },
        disruptions: {
          where: { status: 'active' },
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, trips });
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create trip
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, startDate, endDate, travelerId = 'traveler_1', initialBookings = [] } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, startDate, endDate)' },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        travelerId,
      },
    });

    // If initial bookings were supplied, create them and auto-infer links
    if (Array.isArray(initialBookings) && initialBookings.length > 0) {
      const createdBookings = [];
      for (const b of initialBookings) {
        const booking = await prisma.booking.create({
          data: {
            tripId: trip.id,
            type: b.type,
            provider: b.provider,
            title: b.title,
            startTime: new Date(b.startTime),
            endTime: new Date(b.endTime),
            location: b.location,
            cost: b.cost || 0,
            cancellationPolicy: b.cancellationPolicy || 'Standard policy',
            refundable: b.refundable ?? true,
            details: b.details ? JSON.stringify(b.details) : null,
          },
        });
        createdBookings.push(booking);
      }

      const inferredLinks = autoInferLinks(
        createdBookings.map((b) => ({
          id: b.id,
          type: b.type,
          startTime: new Date(b.startTime),
          endTime: new Date(b.endTime),
          location: b.location,
        }))
      );

      for (const link of inferredLinks) {
        await prisma.bookingLink.create({
          data: link,
        });
      }
    }

    const finalTrip = await prisma.trip.findUnique({
      where: { id: trip.id },
      include: {
        bookings: { orderBy: { startTime: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, trip: finalTrip }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create trip' },
      { status: 500 }
    );
  }
}
