import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

const projectId = process.env.VERCEL_PROJECT_ID;
const token = process.env.VERCEL_TOKEN;
const teamId = process.env.VERCEL_TEAM_ID; // Optional, only if using a Vercel Team

// Helper function to add domain to Vercel
async function addDomainToVercel(domain: string) {
  if (!projectId || !token) {
    return { success: false, error: 'Vercel API credentials missing' };
  }

  const url = `https://api.vercel.com/v10/projects/${projectId}/domains${teamId ? `?teamId=${teamId}` : ''}`;

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

    if (response.ok || data.error?.code === 'domain_already_in_use') {
      return { success: true, data };
    }

    return { success: false, error: data.error?.message || 'Failed to add domain to Vercel' };
  } catch (error: any) {
    console.error('Vercel Add Domain Error:', error);
    return { success: false, error: error.message };
  }
}

// Helper to check domain verification status and get required records
async function getVercelDomainStatus(domain: string) {
  if (!projectId || !token) return null;

  const configUrl = `https://api.vercel.com/v6/domains/${domain}/config${teamId ? `?teamId=${teamId}` : ''}`;
  const domainUrl = `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}${teamId ? `?teamId=${teamId}` : ''}`;

  try {
    const [configRes, domainRes] = await Promise.all([
      fetch(configUrl, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(domainUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const config = await configRes.json();
    const domainData = await domainRes.json();

    return {
      config,
      domainData,
      verified: domainData.verified || false,
      misconfigured: config.misconfigured || false
    };
  } catch (error) {
    console.error('Vercel Status Check Error:', error);
    return null;
  }
}

// Helper to trigger Vercel verification
async function verifyDomainOnVercel(domain: string) {
  if (!projectId || !token) return null;
  const url = `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}/verify${teamId ? `?teamId=${teamId}` : ''}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { gymId, domain } = await req.json();

    if (!gymId || !domain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Clean domain input (but keep www if user provided it specifically)
    let normalizedDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0];

    if (normalizedDomain.includes('gympilotpro.com')) {
      return NextResponse.json({ error: 'Cannot connect internal domains' }, { status: 400 });
    }

    // 2. Add to Vercel First
    const addResult = await addDomainToVercel(normalizedDomain);
    if (!addResult.success) {
      return NextResponse.json({ error: addResult.error }, { status: 500 });
    }

    // 3. Attempt verification
    await verifyDomainOnVercel(normalizedDomain);

    // 4. Check Status
    const status = await getVercelDomainStatus(normalizedDomain);

    if (!status) {
      return NextResponse.json({ error: 'Failed to verify status with Vercel' }, { status: 500 });
    }

    // 5. If not verified, return required DNS records to the UI
    if (!status.verified || status.misconfigured) {
      // Vercel returns required records in config.misconfigured or domainData.verification
      const verificationResponse = {
        success: false,
        verified: false,
        requiresAction: true,
        domain: normalizedDomain,
        // Provide Vercel's recommended DNS configuration
        recommendedConfig: {
          type: normalizedDomain.includes('.') && normalizedDomain.split('.').length > 2 ? 'CNAME' : 'A',
          name: normalizedDomain.includes('.') && normalizedDomain.split('.').length > 2 ? normalizedDomain.split('.')[0] : '@',
          value: normalizedDomain.includes('.') && normalizedDomain.split('.').length > 2 ? 'cname.vercel-dns.com' : '76.76.21.21'
        }
      };
      
      return NextResponse.json(verificationResponse);
    }

    // 6. Success: Update Database
    const gymUrl = `https://${normalizedDomain}`;
    const qrCodeUrl = await QRCode.toDataURL(gymUrl, {
      color: { dark: '#000000', light: '#ffffff' },
      margin: 1,
      width: 400,
    });

    await prisma.gym.update({
      where: { id: gymId },
      data: {
        customDomain: normalizedDomain,
        domainVerified: true,
        qrCodeUrl: qrCodeUrl,
      },
    });

    return NextResponse.json({ 
      success: true, 
      verified: true,
      message: 'Domain connected and verified successfully!' 
    });

  } catch (error: any) {
    console.error('Domain Verification Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
