const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting migration to multi-tenant...')

  // 1. Create default Gym
  const defaultGym = await prisma.gym.upsert({
    where: { slug: 'klimarx' },
    update: {},
    create: {
      name: 'Klimarx',
      slug: 'klimarx',
      email: 'contact@klimarx.com',
    },
  })
  
  console.log(`Default gym created/found: ${defaultGym.name} (${defaultGym.id})`)

  const gymId = defaultGym.id

  // 2. Update Users
  const usersRes = await prisma.user.updateMany({
    where: { gymId: null },
    data: { gymId },
  })
  console.log(`Updated ${usersRes.count} Users`)

  // 3. Update MemberProfiles
  const memberProfilesRes = await prisma.memberProfile.updateMany({
    where: { gymId: null },
    data: { gymId },
  })
  console.log(`Updated ${memberProfilesRes.count} MemberProfiles`)

  // 4. Update StaffProfiles
  const staffProfilesRes = await prisma.staffProfile.updateMany({
    where: { gymId: null },
    data: { gymId },
  })
  console.log(`Updated ${staffProfilesRes.count} StaffProfiles`)

  // 5. Update MembershipPackages
  const packagesRes = await prisma.membershipPackage.updateMany({
    where: { gymId: null },
    data: { gymId },
  })
  console.log(`Updated ${packagesRes.count} MembershipPackages`)

  // 6. Update Attendances
  const attendancesRes = await prisma.attendance.updateMany({
    where: { gymId: null },
    data: { gymId },
  })
  console.log(`Updated ${attendancesRes.count} Attendances`)

  // 7. Update ProgressNotes
  const notesRes = await prisma.progressNote.updateMany({
    where: { gymId: null },
    data: { gymId },
  })
  console.log(`Updated ${notesRes.count} ProgressNotes`)

  // 8. Update Payments
  const paymentsRes = await prisma.payment.updateMany({
    where: { gymId: null },
    data: { gymId },
  })
  console.log(`Updated ${paymentsRes.count} Payments`)

  console.log('Migration complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
