import { NextRequest, NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth'
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

    // 取得第一個設定記錄，如果不存在則建立預設設定
    let settings = await db.setting.findFirst()
    
    if (!settings) {
      settings = await db.setting.create({
        data: {}
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = await getAuthStatus()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      logoUrl,
      defaultQrStyle,
      custom404Title,
      custom404Description,
      custom404ButtonText,
      custom404ButtonUrl
    } = body

    // 取得第一個設定記錄或建立新的
    let settings = await db.setting.findFirst()
    
    if (settings) {
      settings = await db.setting.update({
        where: { id: settings.id },
        data: {
          ...(logoUrl !== undefined && { logoUrl }),
          ...(defaultQrStyle && { defaultQrStyle }),
          ...(custom404Title && { custom404Title }),
          ...(custom404Description && { custom404Description }),
          ...(custom404ButtonText && { custom404ButtonText }),
          ...(custom404ButtonUrl && { custom404ButtonUrl })
        }
      })
    } else {
      settings = await db.setting.create({
        data: {
          logoUrl,
          defaultQrStyle: defaultQrStyle || 'square',
          custom404Title: custom404Title || '404',
          custom404Description: custom404Description || '您尋找的短連結不存在或可能已被移除。',
          custom404ButtonText: custom404ButtonText || '返回首頁',
          custom404ButtonUrl: custom404ButtonUrl || '/'
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 公開端點用於 404 頁面
export async function GET_PUBLIC() {
  try {
    const settings = await db.setting.findFirst()
    
    if (!settings) {
      // 返回預設設定
      return NextResponse.json({
        custom404Title: '404',
        custom404Description: '您尋找的短連結不存在或可能已被移除。',
        custom404ButtonText: '返回首頁',
        custom404ButtonUrl: '/',
        logoUrl: null
      })
    }

    // 只返回 404 相關和 logo 設定
    return NextResponse.json({
      custom404Title: settings.custom404Title,
      custom404Description: settings.custom404Description,
      custom404ButtonText: settings.custom404ButtonText,
      custom404ButtonUrl: settings.custom404ButtonUrl,
      logoUrl: settings.logoUrl
    })
  } catch (error) {
    console.error('Get public settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}