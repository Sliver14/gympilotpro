// scripts/migrate-to-branches.ts
import { prisma } from '../lib/prisma'   // ← Changed to relative path

async function main() {
  console.log('🚀 Starting branch migration...')

  const gyms = await prisma.gym.findMany({
    include: { branches: true }
  })

  for (const gym of gyms) {
    if (gym.branches.length > 0) {
      console.log(`⏭️ Gym "${gym.name}" already has branches, skipping.`)
      continue
    }

    console.log(`Creating Main Branch for gym: ${gym.name}`)

    const mainBranch = await prisma.branch.create({
      data: {
        gymId: gym.id,
        name: 'Main Branch',
        address: gym.address || undefined,
        isActive: true,
      },
    })

    console.log(`✅ Main Branch created for ${gym.name}`)

    // Assign existing records
    await Promise.all([
      prisma.user.updateMany({
        where: { gymId: gym.id, branchId: null },
        data: { branchId: mainBranch.id }
      }),
      prisma.attendance.updateMany({
        where: { gymId: gym.id, branchId: null },
        data: { branchId: mainBranch.id }
      }),
      prisma.payment.updateMany({
        where: { gymId: gym.id, branchId: null },
        data: { branchId: mainBranch.id }
      }),
      prisma.progressNote.updateMany({
        where: { gymId: gym.id, branchId: null },
        data: { branchId: mainBranch.id }
      }),
      prisma.device.updateMany({
        where: { gymId: gym.id, branchId: null },
        data: { branchId: mainBranch.id }
      })
    ])

    console.log(`✅ Records assigned for ${gym.name}`)
  }

  console.log('🎉 Branch migration completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(() => process.exit(0))