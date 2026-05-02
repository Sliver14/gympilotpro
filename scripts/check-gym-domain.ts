import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGymDomain() {
  const gym = await prisma.gym.findUnique({
    where: { slug: 'klimarx' }
  });
  console.log('Gym Slug:', gym?.slug);
  console.log('Custom Domain:', gym?.customDomain);
}

checkGymDomain()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
