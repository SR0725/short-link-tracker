import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recordClick } from '@/lib/short-url'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string; locale: string }> }
) {
  try {
    const { slug, locale } = await context.params
    
    const link = await db.link.findUnique({
      where: { slug }
    })

    if (!link) {
      return NextResponse.redirect(new URL(`/${locale}/404`, request.url))
    }

    // Record the click asynchronously
    recordClick(link.id, request).catch(error => {
      console.error('Failed to record click:', error)
    })

    // Redirect to target URL
    return NextResponse.redirect(link.targetUrl, { status: 302 })
  } catch (error) {
    console.error('Redirect error:', error)
    const { locale: localeParam } = await context.params
    return NextResponse.redirect(new URL(`/${localeParam}/404`, request.url))
  }
}