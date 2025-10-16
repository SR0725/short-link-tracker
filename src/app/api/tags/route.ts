import { NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth'
import { db } from '@/lib/db'
import { sanitizeText } from '@/lib/sanitize'

export async function GET() {
  try {
    // 加上權限驗證 - 只有管理員可以存取標籤列表
    const isAuthenticated = await getAuthStatus()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tags = await db.link.findMany({
      where: {
        tag: {
          not: null
        }
      },
      select: {
        tag: true
      },
      distinct: ['tag']
    })

    // 清理標籤內容並過濾
    const uniqueTags = tags
      .map(link => link.tag)
      .filter((tag): tag is string => tag !== null)
      .map(tag => sanitizeText(tag)) // 清理標籤內容
      .filter(tag => tag.length > 0) // 移除空標籤
      .sort()

    return NextResponse.json(uniqueTags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}