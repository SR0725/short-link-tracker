import { NextRequest, NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth'
import { createShortUrl } from '@/lib/short-url'
import { db } from '@/lib/db'
import { linkSchema, validateInput } from '@/lib/validation'
import { sanitizeText, sanitizeTag, sanitizeSlug } from '@/lib/sanitize'
import { getLanguageFromRequest } from '@/lib/i18n/server'
import { translations } from '@/lib/i18n'

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

    const body = await request.json()

    // 獲取用戶語言偏好
    const lang = getLanguageFromRequest(request)

    // 驗證輸入資料
    const validationResult = validateInput(linkSchema, body, lang)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // 清理和驗證各個欄位
    const cleanedTitle = validatedData.title ? sanitizeText(validatedData.title) : null
    const cleanedTag = validatedData.tag ? sanitizeTag(validatedData.tag) : null
    const cleanedSlug = validatedData.customSlug ? sanitizeSlug(validatedData.customSlug) : undefined

    // targetUrl 已經通過 Zod 驗證，是有效的 HTTP(S) URL
    const targetUrl = validatedData.targetUrl

    // 建立短連結
    const result = await createShortUrl(targetUrl, cleanedSlug, {
      title: cleanedTitle ?? undefined,
      tag: cleanedTag ?? undefined,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      clickLimit: validatedData.clickLimit ? Number(validatedData.clickLimit) : undefined
    })

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

    return NextResponse.json({
      id: result.id,
      slug: result.slug,
      shortUrl: `${baseUrl}/${result.slug}`,
      targetUrl: targetUrl,
      title: cleanedTitle,
      tag: cleanedTag,
      expiresAt: validatedData.expiresAt,
      clickLimit: validatedData.clickLimit
    })
  } catch (error) {
    console.error('Create link error:', error)

    // 獲取語言偏好以返回本地化錯誤訊息
    const lang = getLanguageFromRequest(request)
    const t = translations[lang]

    if (error instanceof Error && error.message === 'Slug already exists') {
      return NextResponse.json(
        { error: t.validationSlugExists },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}