import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExpiries() {
  const members = await prisma.memberProfile.findMany({
    where: { gymId: 'cmmui8loz0000j3h4h6t8by6k' },
    include: { user: true }
  });
  
  members.forEach(m => {
    console.log(`${m.user.email} | ${m.expiryDate.toISOString()} | ${m.expiryDate.toString()}`);
  });
}

checkExpiries()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
