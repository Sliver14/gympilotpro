import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting QR code generation for existing gyms...');
  
  const gyms = await prisma.gym.findMany({
    where: {
      qrCodeUrl: null,
    },
  });

  console.log(`Found ${gyms.length} gyms without a QR code.`);

  for (const gym of gyms) {
    try {
      const protocol = 'https://';
      const domain = gym.customDomain && gym.domainVerified 
        ? gym.customDomain 
        : `${gym.slug}.gympilotpro.com`;
        
      const gymUrl = `${protocol}${domain}`;
      
      const qrCodeUrl = await QRCode.toDataURL(gymUrl, {
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        margin: 1,
        width: 400,
      });

      await prisma.gym.update({
        where: { id: gym.id },
        data: { qrCodeUrl },
      });

      console.log(`✅ Generated QR code for gym: ${gym.name} (${domain})`);
    } catch (error) {
      console.error(`❌ Failed to generate QR code for gym: ${gym.name}`, error);
    }
  }

  console.log('✅ QR code backfill complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
