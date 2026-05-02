import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllSubscriptions() {
  console.log('--- CHECKING ALL GYM SUBSCRIPTIONS ---');
  
  const subs = await prisma.gymSubscription.findMany({
    include: {
      gym: true
    }
  });

  if (subs.length === 0) {
    console.log('No gym subscriptions found.');
    return;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  subs.forEach(sub => {
    const diffTime = sub.endDate.getTime() - todayStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`Gym: ${sub.gym.name} (${sub.gym.slug})`);
    console.log(`  Plan: ${sub.plan}, Status: ${sub.status}`);
    console.log(`  End Date: ${sub.endDate}`);
    console.log(`  Days until expiry: ${diffDays}`);
    
    if ([7, 3, 0].includes(diffDays)) {
      console.log(`  >>> SHOULD TRIGGER REMINDER TODAY!`);
    } else if (diffDays < 0) {
      console.log(`  (Already expired)`);
    } else {
      console.log(`  Next reminder in ${diffDays - 7} days (for 7-day reminder)`);
    }
    console.log('---');
  });
}

checkAllSubscriptions()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
