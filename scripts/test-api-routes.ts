import { GET as getTrips } from '../app/api/trips/route';
import { GET as getTripById } from '../app/api/trips/[id]/route';
import { POST as simulateDisruption } from '../app/api/disruptions/simulate/route';
import { GET as getDisruptionImpact } from '../app/api/disruptions/[id]/impact/route';
import { GET as getRecoveryPlans } from '../app/api/disruptions/[id]/recovery-plans/route';
import { POST as applyRecoveryPlan } from '../app/api/recovery-plans/[id]/apply/route';
import { GET as getRiskWarnings } from '../app/api/trips/[id]/risk-warnings/route';
import { POST as addBooking } from '../app/api/trips/[id]/bookings/route';
import { POST as resetDb } from '../app/api/seed/reset/route';

async function testApiRoutes() {
  console.log('🚀 Testing API Routes Directly...');

  // 1. Reset DB
  console.log('\n1. Testing POST /api/seed/reset...');
  const resetRes = await resetDb();
  const resetData = await resetRes.json();
  console.log('✓ Reset response:', resetData.message);
  const tripId = resetData.trip.id;

  // 2. GET /api/trips
  console.log('\n2. Testing GET /api/trips...');
  const tripsRes = await getTrips();
  const tripsData = await tripsRes.json();
  console.log(`✓ Fetched ${tripsData.trips.length} trip(s).`);

  // 3. GET /api/trips/[id]
  console.log(`\n3. Testing GET /api/trips/${tripId}...`);
  const tripRes = await getTripById(new Request('http://localhost:3000'), {
    params: Promise.resolve({ id: tripId }),
  });
  const tripData = await tripRes.json();
  console.log(`✓ Fetched trip "${tripData.trip.name}" with ${tripData.graph.nodes.length} nodes and ${tripData.graph.edges.length} edges.`);
  console.log(`✓ Proactive risks detected: ${tripData.proactiveRisks.length}`);

  // 4. POST /api/disruptions/simulate
  const targetBooking = tripData.trip.bookings.find((b: { id: string; title: string }) => b.title.includes('DL 412'));
  console.log(`\n4. Testing POST /api/disruptions/simulate on "${targetBooking.title}"...`);
  const simReq = new Request('http://localhost:3000/api/disruptions/simulate', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: targetBooking.id,
      tripId,
      type: 'delay',
      delayMinutes: 120,
      reason: 'Air traffic control ground stop at SFO',
    }),
  });
  const simRes = await simulateDisruption(simReq);
  const simData = await simRes.json();
  console.log(`✓ Disruption simulated. Event ID: ${simData.disruptionEvent.id}`);
  console.log(`✓ Impacted nodes count: ${simData.impact.impactedNodes.length}`);
  const disruptionId = simData.disruptionEvent.id;

  // 5. GET /api/disruptions/[id]/impact
  console.log(`\n5. Testing GET /api/disruptions/${disruptionId}/impact...`);
  const impactRes = await getDisruptionImpact(new Request('http://localhost:3000'), {
    params: Promise.resolve({ id: disruptionId }),
  });
  const impactData = await impactRes.json();
  console.log(`✓ Impact API returned ${impactData.impact.impactedNodes.length} impacted items.`);

  // 6. GET /api/disruptions/[id]/recovery-plans
  console.log(`\n6. Testing GET /api/disruptions/${disruptionId}/recovery-plans...`);
  const plansRes = await getRecoveryPlans(new Request('http://localhost:3000'), {
    params: Promise.resolve({ id: disruptionId }),
  });
  const plansData = await plansRes.json();
  console.log(`✓ Recovery Plans returned (Source: ${plansData.source}): ${plansData.plan.options.length} options`);
  const firstOption = plansData.plan.options[0];
  const formattedCostDelta = firstOption.costDelta === 0
    ? '₹0'
    : `${firstOption.costDelta < 0 ? '-' : '+'}₹${Math.abs(firstOption.costDelta).toLocaleString('en-IN')}`;
  console.log(`   Top option: "${firstOption.title}" (Score: ${firstOption.convenienceScore}, Cost: ${formattedCostDelta})`);
  const planId = plansData.plan.id;
  const optionId = firstOption.id;

  // 7. POST /api/recovery-plans/[id]/apply
  console.log(`\n7. Testing POST /api/recovery-plans/${planId}/apply with option ${optionId}...`);
  const applyReq = new Request(`http://localhost:3000/api/recovery-plans/${planId}/apply`, {
    method: 'POST',
    body: JSON.stringify({ optionId }),
  });
  const applyRes = await applyRecoveryPlan(applyReq, {
    params: Promise.resolve({ id: planId }),
  });
  const applyData = await applyRes.json();
  console.log('✓ Applied response message:', applyData.message);
  console.log('✓ Changed bookings diff:', applyData.diff.changedBookings.length, 'booking(s) modified:');
  applyData.diff.changedBookings.forEach((cb: { title: string; newTitle: string; newStatus: string }) => {
    console.log(`   • ${cb.title} -> ${cb.newTitle} (${cb.newStatus})`);
  });

  // 8. GET /api/trips/[id]/risk-warnings
  console.log(`\n8. Testing GET /api/trips/${tripId}/risk-warnings...`);
  const risksRes = await getRiskWarnings(new Request('http://localhost:3000'), {
    params: Promise.resolve({ id: tripId }),
  });
  const risksData = await risksRes.json();
  console.log(`✓ Post-recovery proactive risk count: ${risksData.totalRisks}`);

  // 9. POST /api/trips/[id]/bookings (Dynamic Node Insertion)
  console.log(`\n9. Testing POST /api/trips/${tripId}/bookings (Dynamic Node Insertion)...`);
  const newBookingReq = new Request(`http://localhost:3000/api/trips/${tripId}/bookings`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'TRANSFER',
      provider: 'Blacklane VIP Chauffeur',
      title: 'Airport Transfer: LHR Terminal 5 → The Savoy',
      location: 'LHR to Central London',
      cost: 11500,
      startTime: '2026-09-16T12:00:00Z',
      endTime: '2026-09-16T13:30:00Z',
      cancellationPolicy: 'Free cancellation up to 4 hours before pickup',
      refundable: true,
    }),
  });
  const addBookingRes = await addBooking(newBookingReq, {
    params: Promise.resolve({ id: tripId }),
  });
  const addBookingData = await addBookingRes.json();
  if (!addBookingData.success || !addBookingData.isDAG) {
    throw new Error('Add booking failed or breached DAG cycle freedom: ' + JSON.stringify(addBookingData));
  }
  console.log(`✓ Node insertion verified: "${addBookingData.booking.title}" (DAG valid: ${addBookingData.isDAG}, Nodes: ${addBookingData.graph.nodes.length}, Edges: ${addBookingData.graph.edges.length})`);

  console.log('\n🎊 ALL API ROUTES VERIFIED END-TO-END WITH ZERO ERRORS!');
}

testApiRoutes().catch((err) => {
  console.error('❌ API Test failed:', err);
  process.exit(1);
});
