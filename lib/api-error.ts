import { NextResponse } from 'next/server'

export function handleApiError(error: unknown) {
  console.error('[API Error]', error)

  if (error instanceof Error) {
    // Prisma errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please ensure your database is running.' },
        { status: 503 }
      )
    }

    // Validation errors
    if (error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}
