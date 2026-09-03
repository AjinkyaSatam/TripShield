import { prisma } from './prisma';
import { hashPassword } from './auth';

export async function resetAndSeedDatabase() {
  console.log('🌱 Clearing existing database records...');
  await prisma.session.deleteMany();
  await prisma.recoveryOption.deleteMany();
  await prisma.recoveryPlan.deleteMany();
  await prisma.disruptionEvent.deleteMany();
  await prisma.bookingLink.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.mockInventoryItem.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Enterprise Users
  console.log('👤 Seeding Enterprise Users...');
  const userAlex = await prisma.user.create({
    data: {
      email: 'alex.mercer@stratos-ai.com',
      name: 'Alex Mercer',
      password: hashPassword('Password123!'),
      role: 'TRAVELER',
      company: 'Stratos AI Corp',
      tier: 'Diamond Shield VIP',
      phone: '+91 98200 45192',
    },
  });

  const userElena = await prisma.user.create({
    data: {
      email: 'elena.rostova@familytravel.io',
      name: 'Elena Rostova',
      password: hashPassword('Password123!'),
      role: 'TRAVELER',
      company: 'Private Family Itinerary',
      tier: 'Platinum Family Shield',
      phone: '+91 98450 12344',
    },
  });

  const userMarcus = await prisma.user.create({
    data: {
      email: 'marcus.vance@techsummit.org',
      name: 'Marcus Vance',
      password: hashPassword('Password123!'),
      role: 'TRAVEL_MANAGER',
      company: 'Global Tech Summits',
      tier: 'Gold Shield Priority',
      phone: '+91 98110 56788',
    },
  });

  // 2. Mock Inventory Pool in INR (Indian Rupees)
  console.log('📦 Seeding Mock Inventory pool in INR...');
  await prisma.mockInventoryItem.createMany({
    data: [
      {
        category: 'FLIGHT',
        provider: 'British Airways',
        name: 'Flight BA 178 (JFK → LHR)',
        location: 'JFK to LHR',
        startTime: new Date('2026-09-15T19:30:00Z'),
        endTime: new Date('2026-09-16T07:45:00Z'),
        cost: 75500.0,
        cancellationPolicy: 'Free cancellation within 24h, fully rebookable',
        refundable: true,
        metadata: JSON.stringify({
          flightNumber: 'BA 178',
          aircraft: 'Boeing 777-300ER',
          cabinClass: 'Club World / Business',
          layoverMin: 0,
          reliabilityScore: 94,
        }),
      },
      {
        category: 'FLIGHT',
        provider: 'American Airlines',
        name: 'Flight AA 100 (JFK → LHR)',
        location: 'JFK to LHR',
        startTime: new Date('2026-09-15T20:45:00Z'),
        endTime: new Date('2026-09-16T09:00:00Z'),
        cost: 69500.0,
        cancellationPolicy: 'Non-refundable fare delta, free same-day change',
        refundable: false,
        metadata: JSON.stringify({
          flightNumber: 'AA 100',
          aircraft: 'Boeing 777-200',
          cabinClass: 'Flagship Business',
          layoverMin: 0,
          reliabilityScore: 91,
        }),
      },
      {
        category: 'FLIGHT',
        provider: 'United Airlines',
        name: 'Direct Re-route: Flight UA 901 (SFO → LHR Direct)',
        location: 'SFO to LHR',
        startTime: new Date('2026-09-15T12:45:00Z'),
        endTime: new Date('2026-09-16T07:15:00Z'),
        cost: 83000.0,
        cancellationPolicy: 'Refundable with ₹4,000 fee, bypasses JFK layover completely',
        refundable: true,
        metadata: JSON.stringify({
          flightNumber: 'UA 901',
          aircraft: 'Boeing 787-9 Dreamliner',
          cabinClass: 'Polaris Business',
          direct: true,
          layoverMin: 0,
          reliabilityScore: 97,
        }),
      },
      {
        category: 'FLIGHT',
        provider: 'Virgin Atlantic',
        name: 'Flight VS 046 (JFK → LHR Next Morning)',
        location: 'JFK to LHR',
        startTime: new Date('2026-09-15T23:00:00Z'),
        endTime: new Date('2026-09-16T11:10:00Z'),
        cost: 64500.0,
        cancellationPolicy: 'Standard flexible',
        refundable: true,
        metadata: JSON.stringify({
          flightNumber: 'VS 046',
          aircraft: 'Airbus A350-1000',
          cabinClass: 'Upper Class',
          layoverMin: 0,
          reliabilityScore: 89,
        }),
      },
      {
        category: 'TRANSFER',
        provider: 'Heathrow VIP Fast-Track Chauffeur',
        name: 'Express Chauffeur: LHR to Central London',
        location: 'LHR to Central London',
        startTime: new Date('2026-09-16T08:15:00Z'),
        endTime: new Date('2026-09-16T09:00:00Z'),
        cost: 9300.0,
        cancellationPolicy: 'Free cancellation up to 2 hours before pickup',
        refundable: true,
        metadata: JSON.stringify({
          vehicle: 'Mercedes S-Class EQ',
          transitMinutes: 45,
          flightTrackingIncluded: true,
        }),
      },
      {
        category: 'TRANSFER',
        provider: 'London Blacklane VIP',
        name: 'Flexible Executive Transfer (On-demand standby)',
        location: 'LHR to Central London',
        startTime: new Date('2026-09-16T09:30:00Z'),
        endTime: new Date('2026-09-16T10:15:00Z'),
        cost: 8000.0,
        cancellationPolicy: 'Free cancellation up to 1 hour before pickup',
        refundable: true,
        metadata: JSON.stringify({
          vehicle: 'BMW 7 Series',
          transitMinutes: 45,
          flightTrackingIncluded: true,
        }),
      },
      {
        category: 'HOTEL',
        provider: 'The Savoy London',
        name: 'The Savoy London — Late Check-In Guarantee & Luggage Fast-Track',
        location: 'Central London (Strand)',
        startTime: new Date('2026-09-16T13:00:00Z'),
        endTime: new Date('2026-09-17T11:00:00Z'),
        cost: 55000.0,
        cancellationPolicy: 'Modified check-in time, no penalty fee',
        refundable: true,
        metadata: JSON.stringify({
          roomType: 'Luxury King Suite',
          lateCheckIn: true,
          guaranteedHolding: true,
        }),
      },
      {
        category: 'ACTIVITY',
        provider: 'London Eye VIP Experiences',
        name: 'Rescheduled Sunset Champagne Capsule',
        location: 'South Bank, London',
        startTime: new Date('2026-09-16T17:30:00Z'),
        endTime: new Date('2026-09-16T18:30:00Z'),
        cost: 15200.0,
        cancellationPolicy: 'Same-day reschedule permitted',
        refundable: true,
        metadata: JSON.stringify({
          experience: 'Private Capsule',
          rescheduledSlot: true,
        }),
      },
    ],
  });

  // 3. Trip 1 (Primary): European AI Summit & London Client Tour (Alex Mercer)
  console.log('✈️ Seeding Primary Trip for Alex Mercer in INR...');
  const trip1 = await prisma.trip.create({
    data: {
      userId: userAlex.id,
      travelerId: userAlex.id,
      name: 'European AI Summit & London Client Tour',
      startDate: new Date('2026-09-15T07:00:00Z'),
      endDate: new Date('2026-09-18T20:00:00Z'),
    },
  });

  const b1 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'FLIGHT',
      provider: 'Delta Air Lines',
      title: 'Flight SFO → JFK (DL 412)',
      startTime: new Date('2026-09-15T07:00:00Z'),
      endTime: new Date('2026-09-15T15:30:00Z'),
      location: 'SFO to JFK',
      status: 'confirmed',
      cost: 35500.0,
      cancellationPolicy: 'Refundable to airline voucher minus ₹4,000 fee',
      refundable: true,
      details: JSON.stringify({
        flightNumber: 'DL 412',
        aircraft: 'Boeing 767-400',
        seat: '4A (First Class)',
        origin: 'SFO (San Francisco)',
        destination: 'JFK (New York)',
        terminal: 'Terminal 2',
      }),
    },
  });

  const b2 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'FLIGHT',
      provider: 'Virgin Atlantic',
      title: 'Flight JFK → LHR (VS 004)',
      startTime: new Date('2026-09-15T17:15:00Z'),
      endTime: new Date('2026-09-16T06:20:00Z'),
      location: 'JFK to LHR',
      status: 'confirmed',
      cost: 72000.0,
      cancellationPolicy: 'Full refund up to 48 hours before departure',
      refundable: true,
      details: JSON.stringify({
        flightNumber: 'VS 004',
        aircraft: 'Airbus A350-1000',
        seat: '2K (Upper Class)',
        origin: 'JFK (New York)',
        destination: 'LHR (London Heathrow)',
        terminal: 'Terminal 4',
      }),
    },
  });

  const b3 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'TRANSFER',
      provider: 'Heathrow Express',
      title: 'Airport Transfer: LHR → Central London',
      startTime: new Date('2026-09-16T07:30:00Z'),
      endTime: new Date('2026-09-16T08:15:00Z'),
      location: 'LHR to Central London',
      status: 'confirmed',
      cost: 7200.0,
      cancellationPolicy: 'Valid all day on booked date',
      refundable: true,
      details: JSON.stringify({
        service: 'Heathrow Express Business First + Black Cab to Strand',
        pickup: 'Heathrow Terminal 3 Station',
        dropoff: 'The Savoy London',
      }),
    },
  });

  const b4 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'HOTEL',
      provider: 'The Savoy London',
      title: 'Hotel Check-In: The Savoy London',
      startTime: new Date('2026-09-16T09:00:00Z'),
      endTime: new Date('2026-09-17T11:00:00Z'),
      location: 'Central London (Strand)',
      status: 'confirmed',
      cost: 55000.0,
      cancellationPolicy: 'Free cancellation until 14:00 on arrival day',
      refundable: true,
      details: JSON.stringify({
        roomType: 'Luxury King Suite (River View)',
        checkInTime: '09:00 (Guaranteed Early Check-in)',
        checkOutTime: '11:00 (+1 day)',
        address: 'Strand, London WC2R 0EZ',
      }),
    },
  });

  const b5 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'EVENT',
      provider: 'Canary Wharf Partners',
      title: 'Meeting: Strategic AI Partnership Board Review',
      startTime: new Date('2026-09-16T10:30:00Z'),
      endTime: new Date('2026-09-16T12:30:00Z'),
      location: 'Canary Wharf, London',
      status: 'confirmed',
      cost: 0.0,
      cancellationPolicy: 'Corporate meeting - non-monetary',
      refundable: true,
      details: JSON.stringify({
        venue: 'One Canada Square, 38th Floor',
        host: 'Lord Alistair Sterling (Chairman)',
        agenda: 'Q3 Enterprise AI Rollout & Capital Allocation',
      }),
    },
  });

  const b6 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'ACTIVITY',
      provider: 'London Eye VIP Experiences',
      title: 'Activity: Private London Eye VIP Capsule',
      startTime: new Date('2026-09-16T14:30:00Z'),
      endTime: new Date('2026-09-16T15:45:00Z'),
      location: 'South Bank, London',
      status: 'confirmed',
      cost: 15200.0,
      cancellationPolicy: 'Non-refundable within 24h; date change allowed with fee',
      refundable: false,
      details: JSON.stringify({
        experience: 'Private Capsule with Pommery Brut Royal Champagne',
        confirmationCode: 'EYE-VIP-9941',
      }),
    },
  });

  const b7 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'TRANSFER',
      provider: 'London Black Cab Executive',
      title: 'City Transfer: Strand → St Pancras Station',
      startTime: new Date('2026-09-16T16:45:00Z'),
      endTime: new Date('2026-09-16T17:30:00Z'),
      location: 'Strand to St Pancras',
      status: 'confirmed',
      cost: 5500.0,
      cancellationPolicy: 'Free cancellation up to 30 min before departure',
      refundable: true,
      details: JSON.stringify({
        vehicle: 'London LEVC Electric Cab',
        pickup: 'The Savoy Forecourt',
        dropoff: 'St Pancras International Eurostar Departure',
      }),
    },
  });

  const b8 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'FLIGHT',
      provider: 'Eurostar International',
      title: 'Train: Eurostar London → Paris (ES 9046)',
      startTime: new Date('2026-09-16T18:31:00Z'),
      endTime: new Date('2026-09-16T21:47:00Z'),
      location: 'St Pancras to Paris Gare du Nord',
      status: 'confirmed',
      cost: 17800.0,
      cancellationPolicy: 'Exchangeable before departure, non-refundable',
      refundable: false,
      details: JSON.stringify({
        trainNumber: 'ES 9046',
        coach: 'Coach 3 (Standard Premier)',
        seat: '31 (Solo window)',
        checkInGateCloses: '18:01 (30 min prior)',
      }),
    },
  });

  const b9 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'HOTEL',
      provider: 'Pullman Hotels & Resorts',
      title: 'Hotel Check-In: Pullman Paris Tour Eiffel',
      startTime: new Date('2026-09-16T22:30:00Z'),
      endTime: new Date('2026-09-18T10:00:00Z'),
      location: 'Paris (15th Arrondissement)',
      status: 'confirmed',
      cost: 44000.0,
      cancellationPolicy: 'Cancel free until 18:00 on arrival day',
      refundable: true,
      details: JSON.stringify({
        roomType: 'Deluxe Room with Eiffel Tower Balcony',
        address: '18 Avenue De Suffren, 75015 Paris',
      }),
    },
  });

  const b10 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'EVENT',
      provider: 'European AI Horizons',
      title: 'Conference: AI Summit Keynote Presentation',
      startTime: new Date('2026-09-17T09:30:00Z'),
      endTime: new Date('2026-09-17T12:30:00Z'),
      location: 'Palais des Congrès de Paris',
      status: 'confirmed',
      cost: 29500.0,
      cancellationPolicy: 'Transferable to colleague, non-refundable',
      refundable: false,
      details: JSON.stringify({
        session: 'Opening Keynote: Autonomous Infrastructure & Graph Reasoning',
        hall: 'Grand Amphithéâtre',
      }),
    },
  });

  const b11 = await prisma.booking.create({
    data: {
      tripId: trip1.id,
      type: 'FLIGHT',
      provider: 'Air France',
      title: 'Flight CDG → SFO (AF 084 Direct)',
      startTime: new Date('2026-09-18T10:15:00Z'),
      endTime: new Date('2026-09-18T12:55:00Z'),
      location: 'Paris CDG to SFO',
      status: 'confirmed',
      cost: 83000.0,
      cancellationPolicy: 'Refundable with ₹12,000 change fee',
      refundable: true,
      details: JSON.stringify({
        flightNumber: 'AF 084',
        aircraft: 'Boeing 777-300ER',
        seat: '7L (Business)',
        origin: 'Paris Charles de Gaulle (CDG Terminal 2E)',
        destination: 'San Francisco International (SFO)',
      }),
    },
  });

  await prisma.bookingLink.createMany({
    data: [
      { fromBookingId: b1.id, toBookingId: b2.id, relationType: 'connects_to', bufferMinutes: 105, minRequiredBufferMinutes: 90 },
      { fromBookingId: b2.id, toBookingId: b3.id, relationType: 'transfer_needed', bufferMinutes: 70, minRequiredBufferMinutes: 45 },
      { fromBookingId: b3.id, toBookingId: b4.id, relationType: 'requires_checkin_before', bufferMinutes: 45, minRequiredBufferMinutes: 30 },
      { fromBookingId: b4.id, toBookingId: b5.id, relationType: 'same_day', bufferMinutes: 90, minRequiredBufferMinutes: 45 },
      { fromBookingId: b5.id, toBookingId: b6.id, relationType: 'same_day', bufferMinutes: 120, minRequiredBufferMinutes: 45 },
      { fromBookingId: b6.id, toBookingId: b7.id, relationType: 'same_day', bufferMinutes: 60, minRequiredBufferMinutes: 30 },
      { fromBookingId: b7.id, toBookingId: b8.id, relationType: 'connects_to', bufferMinutes: 61, minRequiredBufferMinutes: 45 },
      { fromBookingId: b8.id, toBookingId: b9.id, relationType: 'requires_checkin_before', bufferMinutes: 43, minRequiredBufferMinutes: 35 },
      { fromBookingId: b9.id, toBookingId: b10.id, relationType: 'same_day', bufferMinutes: 660, minRequiredBufferMinutes: 60 },
      { fromBookingId: b9.id, toBookingId: b11.id, relationType: 'connects_to', bufferMinutes: 135, minRequiredBufferMinutes: 120 },
    ],
  });

  // 4. Trip 2: Tokyo Global Tech Expo (Elena Rostova)
  console.log('🗾 Seeding Trip 2 in INR...');
  const trip2 = await prisma.trip.create({
    data: {
      userId: userElena.id,
      travelerId: userElena.id,
      name: 'Tokyo Global Tech Expo & Kyoto Retreat',
      startDate: new Date('2026-10-10T08:00:00Z'),
      endDate: new Date('2026-10-15T18:00:00Z'),
    },
  });

  const t2_b1 = await prisma.booking.create({
    data: {
      tripId: trip2.id,
      type: 'FLIGHT',
      provider: 'All Nippon Airways',
      title: 'Flight SFO → HND (NH 107)',
      startTime: new Date('2026-10-10T08:00:00Z'),
      endTime: new Date('2026-10-11T12:30:00Z'),
      location: 'SFO to Tokyo Haneda',
      status: 'confirmed',
      cost: 97500.0,
    },
  });

  const t2_b2 = await prisma.booking.create({
    data: {
      tripId: trip2.id,
      type: 'TRANSFER',
      provider: 'Tokyo Monorail Express',
      title: 'Transit: Haneda → Shinjuku',
      startTime: new Date('2026-10-11T13:45:00Z'),
      endTime: new Date('2026-10-11T14:35:00Z'),
      location: 'HND to Shinjuku',
      status: 'confirmed',
      cost: 2100.0,
    },
  });

  const t2_b3 = await prisma.booking.create({
    data: {
      tripId: trip2.id,
      type: 'HOTEL',
      provider: 'Park Hyatt Tokyo',
      title: 'Hotel Check-In: Park Hyatt Tokyo',
      startTime: new Date('2026-10-11T15:00:00Z'),
      endTime: new Date('2026-10-13T11:00:00Z'),
      location: 'Shinjuku, Tokyo',
      status: 'confirmed',
      cost: 66000.0,
    },
  });

  await prisma.bookingLink.createMany({
    data: [
      { fromBookingId: t2_b1.id, toBookingId: t2_b2.id, relationType: 'transfer_needed', bufferMinutes: 75, minRequiredBufferMinutes: 50 },
      { fromBookingId: t2_b2.id, toBookingId: t2_b3.id, relationType: 'requires_checkin_before', bufferMinutes: 25, minRequiredBufferMinutes: 20 },
    ],
  });

  // 5. Trip 3: Alps Ski & Zurich Executive Forum (Marcus Vance)
  console.log('⛷️ Seeding Trip 3 in INR...');
  const trip3 = await prisma.trip.create({
    data: {
      userId: userMarcus.id,
      travelerId: userMarcus.id,
      name: 'Alps Ski & Zurich Executive Forum',
      startDate: new Date('2026-11-04T09:00:00Z'),
      endDate: new Date('2026-11-08T17:00:00Z'),
    },
  });

  const t3_b1 = await prisma.booking.create({
    data: {
      tripId: trip3.id,
      type: 'FLIGHT',
      provider: 'Swiss International Air Lines',
      title: 'Flight JFK → ZRH (LX 015)',
      startTime: new Date('2026-11-04T09:00:00Z'),
      endTime: new Date('2026-11-04T22:45:00Z'),
      location: 'JFK to Zurich',
      status: 'confirmed',
      cost: 78000.0,
    },
  });

  const t3_b2 = await prisma.booking.create({
    data: {
      tripId: trip3.id,
      type: 'HOTEL',
      provider: 'The Dolder Grand Zurich',
      title: 'Hotel Check-In: The Dolder Grand',
      startTime: new Date('2026-11-04T23:30:00Z'),
      endTime: new Date('2026-11-06T11:00:00Z'),
      location: 'Zurich, Switzerland',
      status: 'confirmed',
      cost: 71000.0,
    },
  });

  await prisma.bookingLink.create({
    data: {
      fromBookingId: t3_b1.id,
      toBookingId: t3_b2.id,
      relationType: 'requires_checkin_before',
      bufferMinutes: 45,
      minRequiredBufferMinutes: 30,
    },
  });

  console.log('✅ Database seeded in Indian Rupees (INR - ₹)!');
  return trip1;
}
