import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const token = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64url')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

export async function verifySession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          memberProfile: true, // Include member profile for expiry check
          staffProfile: true,  // Include staff profile
          gym: true,           // Include gym for redirection logic
        },
      },
    },
  })

  if (!session || new Date() > session.expiresAt) {
    return null
  }

  const { user } = session

  // --- NEW: Auto-unverify logic for expired members ---
  if (user && user.memberProfile) {
    const { expiryDate, verified } = user.memberProfile
    const now = new Date()

    if (verified && expiryDate < now) {
      console.log(`User ${user.email}'s membership has expired. Setting verified = false.`);
      const updatedProfile = await prisma.memberProfile.update({
        where: { userId: user.id },
        data: { verified: false },
      })
      // Ensure the returned user object has the most up-to-date status
      user.memberProfile.verified = updatedProfile.verified
    }
  }

  return user
}

export function getDashboardRedirectPath(user: any) {
  if (user.role === 'superadmin') {
    return '/saas-admin/dashboard';
  }

  const gymSlug = user.gym?.slug;
  if (!gymSlug) return null;

  let rolePath = '';
  switch (user.role) {
    case 'admin':
      rolePath = 'admin/dashboard';
      break;
    case 'secretary':
      rolePath = 'secretary/dashboard';
      break;
    case 'trainer':
      rolePath = 'trainer/dashboard';
      break;
    default:
      rolePath = 'member/dashboard';
  }

  return `/${gymSlug}/${rolePath}`;
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  return verifySession(token)
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

export async function requireActiveGymSubscription(gymId: string) {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    include: { subscriptions: { orderBy: { endDate: 'desc' }, take: 1 } }
  });

  const latestSub = gym?.subscriptions[0];
  const now = new Date()
  const endDate = latestSub ? new Date(latestSub.endDate) : now
  
  const isExpired = !latestSub || endDate < now || latestSub.status === 'expired';

  if (isExpired) {
    throw new Error('Gym subscription expired');
  }
}
