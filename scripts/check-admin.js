const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'superadmin' }
  });

  if (superAdmin) {
    console.log('✅ Superadmin found in the User table!');
    console.log('Email:', superAdmin.email);
    console.log('Role:', superAdmin.role);
    console.log('Gym ID:', superAdmin.gymId === null ? 'null (Global)' : superAdmin.gymId);
  } else {
    console.log('❌ Superadmin NOT found in the database. Seeding likely failed.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
