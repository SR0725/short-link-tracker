import { NextRequest, NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth'
import { createShortUrl } from '@/lib/short-url'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await getAuthStatus()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // 定義可排序的欄位
    const sortableFields = {
      'createdAt': 'createdAt',
      'lastClickAt': 'lastClickAt', 
      'title': 'title',
      'tag': 'tag',
      'expiresAt': 'expiresAt',
      'clickCount': undefined // 特殊處理，需要透過關聯計數
    }

    let orderBy: Record<string, string | Record<string, string>> = { createdAt: 'desc' }
    
    if (sortableFields[sortBy as keyof typeof sortableFields] !== undefined) {
      if (sortBy === 'clickCount') {
        orderBy = {
          clicks: {
            _count: order as 'asc' | 'desc'
          }
        }
      } else {
        const field = sortableFields[sortBy as keyof typeof sortableFields]
        if (field) {
          orderBy = {
            [field]: order as 'asc' | 'desc'
          }
        }
      }
    }

    const links = await db.link.findMany({
      orderBy,
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
      title: link.title,
      tag: link.tag,
      expiresAt: link.expiresAt,
      clickLimit: link.clickLimit,
      lastClickAt: link.lastClickAt,
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

    const { targetUrl, customSlug, title, tag, expiresAt, clickLimit } = await request.json()

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

    const result = await createShortUrl(targetUrl, customSlug, {
      title,
      tag,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      clickLimit: clickLimit ? parseInt(clickLimit) : undefined
    })
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    return NextResponse.json({
      id: result.id,
      slug: result.slug,
      shortUrl: `${baseUrl}/${result.slug}`,
      targetUrl,
      title,
      tag,
      expiresAt,
      clickLimit
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