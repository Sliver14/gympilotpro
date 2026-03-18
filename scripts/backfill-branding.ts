const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Backfilling gym branding...')

  const gym = await prisma.gym.update({
    where: { slug: 'klimarx' },
    data: {
      primaryColor: '#daa857',
      secondaryColor: '#000000',
      logo: '/WhatsApp_Image_2026-02-25_at_9.54.33_AM-removebg-preview.png',
      heroTitle: 'Forge Your Legacy',
      heroSubtitle: 'Luxury fitness meets raw performance. Elevate your standard at Klimarx Space.',
    },
  })

  console.log(`Updated branding for: ${gym.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
