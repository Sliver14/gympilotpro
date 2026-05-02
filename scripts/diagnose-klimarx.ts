import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
  console.log('--- DIAGNOSING KLIMARX GYM ---');
  
  const gym = await prisma.gym.findUnique({
    where: { slug: 'klimarx' },
    include: {
      subscriptions: true,
      users: {
        where: { role: 'admin' }
      }
    }
  });

  if (!gym) {
    console.error('ERROR: Gym with slug "klimarx" not found.');
    return;
  }

  console.log('Gym Details:');
  console.log(`- ID: ${gym.id}`);
  console.log(`- Name: ${gym.name}`);
  console.log(`- Email: ${gym.email || 'NULL'}`);
  console.log(`- Status: ${gym.status}`);

  console.log('\nAdmin Users:');
  if (gym.users.length === 0) {
    console.log('- No admin users found.');
  } else {
    gym.users.forEach(user => {
      console.log(`- Name: ${user.firstName} ${user.lastName}, Email: ${user.email}`);
    });
  }

  console.log('\nSubscriptions:');
  if (gym.subscriptions.length === 0) {
    console.log('- No subscription records found.');
  } else {
    gym.subscriptions.forEach(sub => {
      console.log(`- ID: ${sub.id}`);
      console.log(`  Plan: ${sub.plan}`);
      console.log(`  Status: ${sub.status}`);
      console.log(`  Start Date: ${sub.startDate}`);
      console.log(`  End Date: ${sub.endDate}`);
      
      // Check if it would match the cron job
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const diffTime = sub.endDate.getTime() - todayStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      console.log(`  Days until expiry (from today): ${diffDays}`);
      if ([7, 3, 0].includes(diffDays)) {
        console.log(`  >>> MATCHES CRON REMINDER DAY: ${diffDays} days remaining!`);
      } else {
        console.log(`  Does not match cron reminder days (7, 3, 0).`);
      }
    });
  }

  console.log('\n--- DIAGNOSIS COMPLETE ---');
}

diagnose()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
