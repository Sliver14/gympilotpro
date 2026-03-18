import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import dns from 'dns/promises';

export async function POST(req: Request) {
  try {
    const { gymId, domain } = await req.json();

    if (!gymId || !domain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize domain
    let normalizedDomain = domain.toLowerCase().trim();
    normalizedDomain = normalizedDomain.replace(/^https?:\/\//, '');
    if (normalizedDomain.startsWith('www.')) {
      normalizedDomain = normalizedDomain.replace('www.', '');
    }
    // Remove trailing slashes or paths
    normalizedDomain = normalizedDomain.split('/')[0];

    // Prevent verifying our root domain or subdomains natively
    if (normalizedDomain.endsWith('gympilotpro.com')) {
      return NextResponse.json({ error: 'Cannot verify internal domains' }, { status: 400 });
    }

    // Check if domain is already taken by another gym
    const existingDomainGym = await prisma.gym.findUnique({
      where: { customDomain: normalizedDomain },
    });

    if (existingDomainGym && existingDomainGym.id !== gymId) {
      return NextResponse.json({ error: 'Domain is already connected to another gym' }, { status: 400 });
    }

    // Domain Verification Logic
    let isVerified = false;

    try {
      // 1. Check A records
      const aRecords = await dns.resolve4(normalizedDomain).catch(() => [] as string[]);
      // Example Vercel IP: 76.76.21.21
      if (aRecords.includes('76.76.21.21')) {
        isVerified = true;
      }

      // 2. Check CNAME records (if A records fail or aren't Vercel's)
      if (!isVerified) {
        const cnameRecords = await dns.resolveCname(normalizedDomain).catch(() => [] as string[]);
        const wwwCnameRecords = await dns.resolveCname(`www.${normalizedDomain}`).catch(() => [] as string[]);

        const validCnames = ['cname.vercel-dns.com'];
        const allCnames = [...cnameRecords, ...wwwCnameRecords].map(c => c.toLowerCase());

        isVerified = allCnames.some(cname => validCnames.includes(cname));
      }

    } catch (dnsError) {
      console.error('DNS Lookup Error:', dnsError);
      return NextResponse.json({ error: 'Failed to lookup DNS records' }, { status: 400 });
    }

    if (isVerified) {
      // Update Gym with verified domain
      await prisma.gym.update({
        where: { id: gymId },
        data: {
          customDomain: normalizedDomain,
          domainVerified: true,
        },
      });

      return NextResponse.json({ success: true, message: 'Domain successfully verified and connected' });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Domain verification failed. Please check your DNS settings and try again in a few minutes.' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Domain Verification Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
