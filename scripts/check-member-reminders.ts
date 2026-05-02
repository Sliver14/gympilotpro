import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMemberReminders() {
  console.log('--- CHECKING MEMBER EXPIRATIONS ---');
  
  const members = await prisma.memberProfile.findMany({
    where: {
      user: {
        deletedAt: null
      }
    },
    include: {
      user: true,
      gym: true
    }
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let matchFound = false;
  members.forEach(member => {
    const diffTime = member.expiryDate.getTime() - todayStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if ([3, 1, 0].includes(diffDays)) {
      console.log(`Member: ${member.user.firstName} ${member.user.lastName} (${member.user.email})`);
      console.log(`  Gym: ${member.gym.name}`);
      console.log(`  Expiry: ${member.expiryDate}`);
      console.log(`  Days remaining: ${diffDays}`);
      console.log(`  >>> SHOULD TRIGGER REMINDER TODAY!`);
      matchFound = true;
    }
  });

  if (!matchFound) {
    console.log('No members match the reminder criteria (3, 1, 0 days) today.');
  }

  console.log('---');
}

checkMemberReminders()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
