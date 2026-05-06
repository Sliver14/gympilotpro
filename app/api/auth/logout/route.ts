import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')

  // Redirect to the current origin's root
  const url = new URL(req.url)
  return NextResponse.redirect(new URL('/', url.origin))
}

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')

  return NextResponse.json({ success: true })
}
