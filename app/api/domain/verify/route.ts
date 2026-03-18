import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import dns from 'dns/promises';
import QRCode from 'qrcode';

// Helper function to add domain to Vercel
async function addDomainToVercel(domain: string) {
  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_TOKEN;

  // If credentials are not set, we bypass the Vercel API check. 
  // This is useful for local development, but in production, they must be set.
  if (!projectId || !token) {
    console.warn('Vercel API credentials missing. Skipping Vercel domain registration.');
    return { success: true, warning: 'Credentials missing' };
  }

  const url = `https://api.vercel.com/v10/projects/${projectId}/domains`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    }

    // If the domain already exists in the Vercel project, treat it as a success (idempotency)
    if (data.error && data.error.code === 'domain_already_in_use') {
       return { success: true, data };
    }

    return { success: false, error: data.error?.message || 'Failed to add domain to Vercel' };
  } catch (error: any) {
    console.error('Vercel API Error:', error);
    return { success: false, error: error.message };
  }
}

// Helper to remove old domain from Vercel
async function removeDomainFromVercel(domain: string) {
  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_TOKEN;

  if (!projectId || !token) return;

  const url = `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`;

  try {
    await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Failed to remove old domain from Vercel:', error);
  }
}

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
    if (normalizedDomain.includes('gympilotpro.com')) {
      return NextResponse.json({ error: 'Cannot connect internal gympilotpro.com domains' }, { status: 400 });
    }

    // Check if domain is already taken by another gym
    const existingDomainGym = await prisma.gym.findUnique({
      where: { customDomain: normalizedDomain },
    });

    if (existingDomainGym && existingDomainGym.id !== gymId) {
      return NextResponse.json({ error: 'Domain is already connected to another gym' }, { status: 400 });
    }

    // Domain Verification Logic (DNS)
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

    if (!isVerified) {
      return NextResponse.json({ 
        success: false, 
        error: 'Domain verification failed. Please check your DNS settings and try again in a few minutes.' 
      }, { status: 400 });
    }

    // ONLY IF DNS SUCCEEDS: Call Vercel API to automatically register the domain
    const vercelResult = await addDomainToVercel(normalizedDomain);
    
    if (!vercelResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: `Failed to register domain with Vercel: ${vercelResult.error}` 
      }, { status: 500 });
    }

    // Find current gym to check if there is an old domain to remove from Vercel
    const currentGym = await prisma.gym.findUnique({
      where: { id: gymId }
    });

    if (currentGym?.customDomain && currentGym.customDomain !== normalizedDomain) {
      // Clean up old domain asynchronously
      removeDomainFromVercel(currentGym.customDomain);
    }

    // Generate new QR Code for custom domain
    const protocol = 'https://';
    const gymUrl = `${protocol}${normalizedDomain}`;
    const qrCodeUrl = await QRCode.toDataURL(gymUrl, {
      color: { dark: '#000000', light: '#ffffff' },
      margin: 1,
      width: 400,
    });

    // Update Gym with verified domain
    await prisma.gym.update({
      where: { id: gymId },
      data: {
        customDomain: normalizedDomain,
        domainVerified: true,
        qrCodeUrl: qrCodeUrl,
      },
    });

    return NextResponse.json({ success: true, message: 'Domain verified and connected successfully' });

  } catch (error: any) {
    console.error('Domain Verification Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
