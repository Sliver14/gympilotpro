import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPayments() {
  const payments = await prisma.saaSPayment.findMany({
    where: { gymId: 'cmmui8loz0000j3h4h6t8by6k' }
  });
  console.log(JSON.stringify(payments, null, 2));
}

checkPayments()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
