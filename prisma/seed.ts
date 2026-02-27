import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create membership packages
  const packages = [
    {
      name: 'Bi-Weekly Pass',
      duration: 14,
      price: 10000,
      description: 'Unlimited gym access for 2 weeks. Perfect for getting started with your fitness journey.',
    },
    {
      name: 'Monthly Pass',
      duration: 30,
      price: 20000,
      description: 'Unlimited gym access for 1 month. Perfect for getting started with your fitness journey.',
    },
    {
      name: 'Quarterly Pass',
      duration: 90,
      price: 55000,
      description: 'Unlimited gym access for 3 months. Great for commitment to your fitness goals.',
    },
        {
      name: 'Semi Anual Pass',
      duration: 180,
      price: 110000,
      description: 'Unlimited gym access for 6 months. Great for commitment to your fitness goals.',
    },
    {
      name: 'Annual Pass',
      duration: 365,
      price: 220000,
      description: 'Unlimited gym access for a full year. Best value for dedicated fitness enthusiasts.',
    },
  ]

  for (const pkg of packages) {
    await prisma.membershipPackage.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg,
    })
  }

  console.log('✓ Database seeded with membership packages')

  // Create a demo admin account (optional)
  const adminEmail = 'admin@klimarx.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const bcrypt = await import('bcrypt')
    const hashedPassword = await bcrypt.default.hash('admin123', 10)

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        staffProfile: {
          create: {},
        },
      },
    })

    console.log('✓ Demo admin account created (email: admin@klimarx.com, password: admin123)')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
