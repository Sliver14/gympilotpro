import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, createSession } from '@/lib/auth'
import { cookies } from 'next/headers'

// Helper function to generate a unique referral code
async function generateUniqueReferralCode(name: string): Promise<string> {
  const base = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()
  let code = ''
  let isUnique = false

  while (!isUnique) {
    const randomSuffix = Math.floor(100 + Math.random() * 900).toString() // 3-digit random suffix
    code = `${base}${randomSuffix}`

    const existing = await prisma.affiliate.findUnique({
      where: { referralCode: code }
    })
    if (!existing) {
      isUnique = true
    }
  }

  return code
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Check if affiliate already exists
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingAffiliate) {
      return NextResponse.json(
        { error: 'An affiliate account with this email already exists' },
        { status: 400 }
      )
    }

    // 2. Check if a User already exists with this email
    let user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      }
    })

    if (user) {
      // User exists, verify password
      const passwordValid = await verifyPassword(password, user.password)
      if (!passwordValid) {
        return NextResponse.json(
          { error: 'Email is already in use by a customer/staff account. Please enter the correct password for that account to link it.' },
          { status: 401 }
        )
      }
    } else {
      // User doesn't exist, create one
      const hashedPassword = await hashPassword(password)
      const names = name.trim().split(/\s+/)
      const firstName = names[0] || 'Affiliate'
      const lastName = names.slice(1).join(' ') || 'User'

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'affiliate',
          status: 'active'
        }
      })
    }

    // 3. Generate a unique referral code
    const referralCode = await generateUniqueReferralCode(name)

    // 4. Create the Affiliate record
    const affiliate = await prisma.affiliate.create({
      data: {
        userId: user.id,
        name: name.trim(),
        email: normalizedEmail,
        referralCode
      }
    })

    // 5. Log them in automatically
    const token = await createSession(user.id)
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      success: true,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode
      }
    })

  } catch (error: any) {
    console.error('Affiliate self-signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
