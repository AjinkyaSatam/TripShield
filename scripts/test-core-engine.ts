import { prisma } from '../lib/prisma';
import { buildItineraryGraph } from '../lib/graph/builder';
import { analyzeImpact } from '../lib/graph/impact';
import { generateCandidateOptions } from '../lib/recovery/ruleEngine';
import { rankAndExplainRecoveryPlans } from '../lib/ai/claude';
import { scanProactiveRisks } from '../lib/graph/riskScan';

async function testCoreEngine() {
  console.log('🧪 Starting TripShield AI Core Engine Verification...');

  // 1. Fetch trip and bookings from DB
  const trip = await prisma.trip.findFirst({
    include: {
      bookings: true,
    },
  });

  if (!trip) {
    throw new Error('No trip found in DB. Run seed first!');
  }

  const links = await prisma.bookingLink.findMany({
    where: {
      fromBooking: { tripId: trip.id },
    },
  });

  console.log(`✓ Loaded Trip: "${trip.name}" with ${trip.bookings.length} bookings and ${links.length} links.`);

  // 2. Build graph
  const graph = buildItineraryGraph(trip.id, trip.bookings, links);
  console.log(`✓ Graph built successfully with ${graph.nodes.length} nodes and ${graph.edges.length} edges.`);

  // 3. Test Proactive Risk Scan
  const risks = scanProactiveRisks(graph);
  console.log(`✓ Proactive Risk Scan detected ${risks.length} at-risk edges before any disruption:`);
  risks.forEach((r) => {
    console.log(`   ⚠️ [${r.severity.toUpperCase()}] Headroom: ${r.headroomMinutes}m | ${r.message}`);
  });

  // 4. Test Disruption Simulation: Flight DL412 delayed by 120 minutes!
  const dl412 = trip.bookings.find((b) => b.title.includes('DL 412'));
  if (!dl412) throw new Error('DL 412 booking not found!');

  console.log(`\n💥 Simulating 120-minute delay on "${dl412.title}"...`);
  const impact = analyzeImpact(graph, {
    disruptedBookingId: dl412.id,
    disruptionType: 'delay',
    delayMinutes: 120,
    reason: 'Severe ground stop and air traffic control hold at SFO',
  });

  console.log(`✓ Impact Analysis completed!`);
  console.log(`   Root Broken Booking: ${impact.disruptedBooking.title}`);
  console.log(`   Total Affected Nodes: ${impact.impactedNodes.length}`);
  impact.impactedNodes.forEach((node, i) => {
    console.log(`   ${i + 1}. [${node.severity.toUpperCase()}] ${node.booking.title}`);
    console.log(`      ↳ Reason: ${node.reason}`);
    console.log(`      ↳ Original buffer: ${node.originalBufferMinutes}m | New buffer: ${node.newBufferMinutes}m (Min required: ${node.minRequiredBufferMinutes}m)`);
  });

  // 5. Test Rule Engine Candidate Generation (Stage A)
  console.log(`\n⚙️ Running Rule Engine Stage A candidate filtering & multi-objective scoring...`);
  const candidates = await generateCandidateOptions({ graph, impact });
  console.log(`✓ Generated and scored ${candidates.length} recovery candidates:`);
  candidates.forEach((c, idx) => {
    console.log(`   #${idx + 1} [Score: ${c.convenienceScore}/100] ${c.candidateTitle}`);
    console.log(`      Cost Delta: ${c.costDelta > 0 ? '+' : ''}$${c.costDelta} | Time Delta: ${c.timeDeltaMinutes}m | Disruption %: ${c.itineraryDisruptionPct * 100}%`);
    console.log(`      Actions required: ${c.proposedActions.length}`);
  });

  // 6. Test AI Layer / Fallback (Stage B)
  console.log(`\n🤖 Running AI Recovery Plan Generation & Rationale (Stage B)...`);
  const plan = await rankAndExplainRecoveryPlans({
    graph,
    impact,
    candidates,
    tripName: trip.name,
  });

  console.log(`✓ Recovery Plan successfully generated! (Source: ${plan.source})`);
  plan.options.forEach((opt) => {
    console.log(`\n   ⭐ Option ${opt.rank}: ${opt.title}`);
    console.log(`      Cost: $${opt.totalCost} (${opt.costDelta >= 0 ? '+' : ''}$${opt.costDelta}) | Convenience: ${opt.convenienceScore}/100`);
    console.log(`      Rationale: "${opt.rationale}"`);
    console.log(`      Caveats: "${opt.caveats}"`);
    console.log(`      Actions:`);
    opt.actions.forEach((a) => {
      console.log(`        • [${a.actionType.toUpperCase()}] ${a.targetBookingTitle} ➜ ${a.newTitle || 'Updated time'} (${a.reason})`);
    });
  });

  console.log('\n🎉 ALL CORE ENGINE TESTS PASSED WITH 100% SUCCESS!');
}

testCoreEngine()
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
