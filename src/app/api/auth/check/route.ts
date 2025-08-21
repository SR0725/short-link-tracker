import { NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth'

export async function GET() {
  try {
    const isAuthenticated = await getAuthStatus()
    console.log('Auth check result:', isAuthenticated)
    return NextResponse.json({ authenticated: isAuthenticated })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false })
  }
}