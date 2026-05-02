const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function diagnose() {
  const gym = await prisma.gym.findUnique({
    where: { slug: 'klimarx' },
    include: {
      subscriptions: true,
      users: {
        where: { role: 'admin' }
      }
    }
  })

  if (!gym) {
    console.log("Gym 'klimarx' not found.")
    return
  }

  console.log("--- Gym Info ---")
  console.log(`ID: ${gym.id}`)
  console.log(`Name: ${gym.name}`)
  console.log(`Email: ${gym.email}`)
  console.log(`Status: ${gym.status}`)
  
  console.log("\n--- Subscriptions ---")
  if (gym.subscriptions.length === 0) {
    console.log("No subscriptions found in GymSubscription table!")
  } else {
    gym.subscriptions.forEach(sub => {
      console.log(`- Plan: ${sub.plan}, Status: ${sub.status}, End Date: ${sub.endDate}`)
    })
  }

  console.log("\n--- Admins ---")
  gym.users.forEach(user => {
    console.log(`- ${user.firstName} ${user.lastName} (${user.email})`)
  })
}

diagnose()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
