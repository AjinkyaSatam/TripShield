import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { autoInferLinks } from '@/lib/graph/builder';

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
      cost = 0,
      cancellationPolicy = 'Standard policy',
      refundable = true,
      details,
    } = body;

    if (!type || !provider || !title || !startTime || !endTime || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        tripId,
        type,
        provider,
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        cost: Number(cost),
        cancellationPolicy,
        refundable: Boolean(refundable),
        details: details ? JSON.stringify(details) : null,
      },
    });

    // Re-infer and refresh links for all bookings in this trip
    const allBookings = await prisma.booking.findMany({
      where: { tripId },
      orderBy: { startTime: 'asc' },
    });

    const inferredLinks = autoInferLinks(
      allBookings.map((b) => ({
        id: b.id,
        type: b.type,
        startTime: new Date(b.startTime),
        endTime: new Date(b.endTime),
        location: b.location,
      }))
    );

    // Refresh links in DB
    await prisma.bookingLink.deleteMany({
      where: {
        fromBooking: { tripId },
      },
    });

    for (const link of inferredLinks) {
      await prisma.bookingLink.create({ data: link });
    }

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add booking' },
      { status: 500 }
    );
  }
}
