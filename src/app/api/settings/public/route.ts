import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sanitizeText, sanitizeUrl } from '@/lib/sanitize'

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

    // 在輸出時再次清理，作為多一層保護
    // 即使資料庫中的資料已經清理過，這裡再次確保安全
    const cleanedSettings = {
      custom404Title: sanitizeText(settings.custom404Title || '404'),
      custom404Description: sanitizeText(settings.custom404Description || '您尋找的短連結不存在或可能已被移除。'),
      custom404ButtonText: sanitizeText(settings.custom404ButtonText || '返回首頁'),
      custom404ButtonUrl: sanitizeUrl(settings.custom404ButtonUrl || '/') || '/',
      logoUrl: settings.logoUrl || null, // logoUrl 已在儲存時驗證，直接使用
      defaultQrStyle: settings.defaultQrStyle || 'square'
    }

    return NextResponse.json(cleanedSettings)
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