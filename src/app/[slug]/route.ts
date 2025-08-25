import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recordClick } from '@/lib/short-url'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    
    const link = await db.link.findUnique({
      where: { slug }
    })

    if (!link) {
      const host = request.headers.get('host')
      const protocol = request.headers.get('x-forwarded-proto') || 'https'
      const baseUrl = host ? `${protocol}://${host}` : new URL(request.url).origin
      return NextResponse.redirect(new URL('/404', baseUrl))
    }

    // Record the click asynchronously
    recordClick(link.id, request).catch(error => {
      console.error('Failed to record click:', error)
    })

    // Redirect to target URL
    return NextResponse.redirect(link.targetUrl, { status: 302 })
  } catch (error) {
    console.error('Redirect error:', error)
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const baseUrl = host ? `${protocol}://${host}` : new URL(request.url).origin
    return NextResponse.redirect(new URL('/404', baseUrl))
  }
}