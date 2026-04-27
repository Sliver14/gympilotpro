const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = 'superadmin@gympilotpro.com';
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { 
      email: superAdminEmail,
      role: 'superadmin'
    },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        firstName: 'SaaS',
        lastName: 'Admin',
        role: 'superadmin',
        gymId: null, // Global admin
        status: 'active'
      },
    });

    console.log(`✅ Super Admin account created successfully!`);
    console.log(`Email: ${superAdminEmail}`);
    console.log(`Password: superadmin123`);
  } else {
    console.log('✅ Super Admin already exists in the database.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding superadmin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
