import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';
import { hasPremiumAccess } from '@/lib/plans';

const projectId = process.env.VERCEL_PROJECT_ID;
const token = process.env.VERCEL_TOKEN;
const teamId = process.env.VERCEL_TEAM_ID; // Optional, only if using a Vercel Team

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to add domain to Vercel
async function addDomainToVercel(domain: string, redirectTarget?: string) {
  if (!projectId || !token) {
    return { success: false, error: 'Vercel API credentials missing' };
  }

  const url = `https://api.vercel.com/v10/projects/${projectId}/domains${teamId ? `?teamId=${teamId}` : ''}`;
  
  const body: any = { name: domain };
  if (redirectTarget) {
    body.redirect = redirectTarget;
    body.redirectStatusCode = 308; // Permanent redirect
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok || data.error?.code === 'domain_already_in_use' || data.error?.code === 'domain_already_in_use_by_another_project') {
      return { success: true, data, alreadyExists: !!data.error };
    }

    return { success: false, error: data.error?.message || 'Failed to add domain to Vercel' };
  } catch (error: any) {
    console.error(`Vercel Add Domain Error (${domain}):`, error);
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
    console.error(`Vercel Status Check Error (${domain}):`, error);
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

// Robust verifier with retry logic
async function verifyWithRetry(domain: string, maxRetries = 2, delayMs = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // 1. Force verification refresh
    await verifyDomainOnVercel(domain);
    
    // 2. Fetch latest status
    const status = await getVercelDomainStatus(domain);
    
    if (status && status.verified && !status.misconfigured) {
      return status; // Success!
    }
    
    if (attempt < maxRetries) {
      console.log(`[Attempt ${attempt}/${maxRetries}] ${domain} verification pending/misconfigured. Retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    } else {
      return status; // Return final status even if failed
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { gymId, domain } = await req.json();

    if (!gymId || !domain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      include: {
        subscriptions: {
          orderBy: { endDate: 'desc' },
          take: 1
        }
      }
    });

    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    const currentPlan = gym.subscriptions?.[0]?.plan || 'starter';
    if (!hasPremiumAccess(currentPlan, 'pro')) {
      return NextResponse.json({ error: 'Custom domains require a Pro or Elite plan. Please upgrade your subscription.' }, { status: 403 });
    }

    // 1. Normalize domains
    let rawDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0];
    const rootDomain = rawDomain.replace(/^www\./, '');
    const wwwDomain = `www.${rootDomain}`;

    if (rootDomain.includes('gympilotpro.com')) {
      return NextResponse.json({ error: 'Cannot connect internal domains' }, { status: 400 });
    }

    // 2. Add BOTH domains to Vercel
    // Add www. first since it's our primary
    const wwwAddResult = await addDomainToVercel(wwwDomain);
    if (!wwwAddResult.success) {
      return NextResponse.json({ error: `Failed to add ${wwwDomain}: ${wwwAddResult.error}` }, { status: 500 });
    }

    // Add root domain and set it to redirect to the primary www. domain
    const rootAddResult = await addDomainToVercel(rootDomain, wwwDomain);
    if (!rootAddResult.success) {
      return NextResponse.json({ error: `Failed to add ${rootDomain}: ${rootAddResult.error}` }, { status: 500 });
    }

    // 3. Attempt verification with retry mechanism for both domains (run in parallel)
    const [wwwStatus, rootStatus] = await Promise.all([
      verifyWithRetry(wwwDomain, 2, 5000), // e.g., max 2 retries with 5 sec delay
      verifyWithRetry(rootDomain, 2, 5000)
    ]);

    if (!wwwStatus || !rootStatus) {
      return NextResponse.json({ error: 'Failed to communicate with Vercel API for domain status' }, { status: 500 });
    }

    // 4. DNS Validation Awareness
    const isWwwVerified = wwwStatus.verified && !wwwStatus.misconfigured;
    const isRootVerified = rootStatus.verified && !rootStatus.misconfigured;

    if (!isWwwVerified || !isRootVerified) {
      // Determine what configuration to recommend to the user via the UI.
      // We prioritize recommending the root A record if it's missing, otherwise the www CNAME.
      let recommendedConfig = null;
      let targetDomain = '';

      if (!isRootVerified) {
        targetDomain = rootDomain;
        recommendedConfig = {
          type: 'A',
          name: '@',
          value: '216.198.79.1'
        };
      } else {
        targetDomain = wwwDomain;
        recommendedConfig = {
          type: 'CNAME',
          name: 'www',
          value: '25f84edf9647823c.vercel-dns-017.com'
        };
      }

      return NextResponse.json({
        success: false,
        verified: false,
        requiresAction: true,
        message: 'DNS configuration required. Please configure the records at your registrar.',
        domain: targetDomain,
        recommendedConfig: recommendedConfig
      });
    }

    // 5. Clean Success: Only triggers when both domains exist, are verified, and properly configured
    // Store the primary domain in the database
    const gymUrl = `https://${wwwDomain}`;
    const qrCodeUrl = await QRCode.toDataURL(gymUrl, {
      color: { dark: '#000000', light: '#ffffff' },
      margin: 1,
      width: 400,
    });

    await prisma.gym.update({
      where: { id: gymId },
      data: {
        customDomain: wwwDomain, // ALWAYS store the primary www variant
        domainVerified: true,
        qrCodeUrl: qrCodeUrl,
      },
    });

    return NextResponse.json({ 
      success: true, 
      verified: true,
      message: 'Both root and www domains connected and verified successfully! www is active as primary.' 
    });

  } catch (error: any) {
    console.error('Domain Verification API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}