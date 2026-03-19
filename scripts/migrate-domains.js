const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Starting domain migration...');
  try {
    const gyms = await prisma.gym.findMany({
      where: {
        customDomain: {
          startsWith: 'www.'
        }
      }
    });

    console.log(`Found ${gyms.length} gyms with "www." prefix.`);

    for (const gym of gyms) {
      if (gym.customDomain) {
        const rootDomain = gym.customDomain.replace(/^www\./, '');
        console.log(`Migrating ${gym.customDomain} -> ${rootDomain}`);
        
        await prisma.gym.update({
          where: { id: gym.id },
          data: { customDomain: rootDomain }
        });
      }
    }

    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();