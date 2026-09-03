import { resetAndSeedDatabase } from '../lib/seedData';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Seeding database using resetAndSeedDatabase()...');
  const trip = await resetAndSeedDatabase();
  console.log(`✅ Seeding completed! Active trip ID: ${trip.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
