import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 公開端點用於 404 頁面和前端顯示
export async function GET() {
  try {
    const settings = await db.setting.findFirst()
    
    if (!settings) {
      // 返回預設設定
      return NextResponse.json({
        custom404Title: '404',
        custom404Description: '您尋找的短連結不存在或可能已被移除。',
        custom404ButtonText: '返回首頁',
        custom404ButtonUrl: '/',
        logoUrl: null,
        defaultQrStyle: 'square'
      })
    }

    // 只返回公開可見的設定
    return NextResponse.json({
      custom404Title: settings.custom404Title,
      custom404Description: settings.custom404Description,
      custom404ButtonText: settings.custom404ButtonText,
      custom404ButtonUrl: settings.custom404ButtonUrl,
      logoUrl: settings.logoUrl,
      defaultQrStyle: settings.defaultQrStyle
    })
  } catch (error) {
    console.error('Get public settings error:', error)
    return NextResponse.json({
      custom404Title: '404',
      custom404Description: '您尋找的短連結不存在或可能已被移除。',
      custom404ButtonText: '返回首頁',
      custom404ButtonUrl: '/',
      logoUrl: null,
      defaultQrStyle: 'square'
    })
  }
}