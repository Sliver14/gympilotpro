const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  const duplicates = await prisma.$queryRaw`
    SELECT "customDomain", COUNT(*)
    FROM "Gym"
    WHERE "customDomain" IS NOT NULL
    GROUP BY "customDomain"
    HAVING COUNT(*) > 1
  `;
  if (duplicates.length > 0) {
    console.error('Duplicates found:', duplicates);
    process.exit(1);
  }
  console.log('No duplicates found. Safe to add @unique.');
}

checkDuplicates().catch(console.error).finally(() => prisma.$disconnect());