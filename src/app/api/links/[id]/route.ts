import { NextRequest, NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await getAuthStatus()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // 檢查連結是否存在
    const existingLink = await db.link.findUnique({
      where: { id }
    })

    if (!existingLink) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // 刪除相關的點擊記錄
    await db.click.deleteMany({
      where: { linkId: id }
    })

    // 刪除連結
    await db.link.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Link deleted successfully' 
    })
  } catch (error) {
    console.error('Delete link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}