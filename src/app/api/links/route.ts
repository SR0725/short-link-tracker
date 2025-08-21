import { NextRequest, NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth'
import { createShortUrl } from '@/lib/short-url'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const isAuthenticated = await getAuthStatus()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const links = await db.link.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { clicks: true }
        }
      }
    })

    const linksWithStats = links.map(link => ({
      id: link.id,
      slug: link.slug,
      targetUrl: link.targetUrl,
      createdAt: link.createdAt,
      clickCount: link._count.clicks
    }))

    return NextResponse.json(linksWithStats)
  } catch (error) {
    console.error('Get links error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await getAuthStatus()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { targetUrl, customSlug } = await request.json()

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      )
    }

    // Basic URL validation
    try {
      new URL(targetUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const result = await createShortUrl(targetUrl, customSlug)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    return NextResponse.json({
      id: result.id,
      slug: result.slug,
      shortUrl: `${baseUrl}/${result.slug}`,
      targetUrl
    })
  } catch (error) {
    console.error('Create link error:', error)
    
    if (error instanceof Error && error.message === 'Slug already exists') {
      return NextResponse.json(
        { error: 'Custom slug already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}