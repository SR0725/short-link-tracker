import { NextRequest, NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth'
import { db } from '@/lib/db'
import { settingsSchema, validateInput } from '@/lib/validation'
import { sanitizeText, sanitizeUrl, sanitizeBase64Image } from '@/lib/sanitize'
import { getLanguageFromRequest } from '@/lib/i18n/server'
import { translations } from '@/lib/i18n'

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

    // 獲取用戶語言偏好
    const lang = getLanguageFromRequest(request)
    const t = translations[lang]

    // 驗證輸入資料
    const validationResult = validateInput(settingsSchema, body, lang)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // 清理和驗證每個欄位
    const cleanedData: Record<string, string | null> = {}

    // 清理 logoUrl
    if (validatedData.logoUrl !== undefined) {
      if (validatedData.logoUrl === null || validatedData.logoUrl === '') {
        cleanedData.logoUrl = null
      } else {
        const sanitizedLogo = sanitizeBase64Image(validatedData.logoUrl)
        if (!sanitizedLogo) {
          return NextResponse.json(
            { error: `${t.validationFieldNameLogoUrl}：${t.validationLogoUrlInvalid}` },
            { status: 400 }
          )
        }
        cleanedData.logoUrl = sanitizedLogo
      }
    }

    // 清理 defaultQrStyle
    if (validatedData.defaultQrStyle) {
      cleanedData.defaultQrStyle = validatedData.defaultQrStyle
    }

    // 清理 404 頁面文字欄位
    if (validatedData.custom404Title !== undefined) {
      const cleaned = sanitizeText(validatedData.custom404Title)
      // 如果清理後變成空字串，拒絕儲存並提示用戶
      if (cleaned.length === 0 && validatedData.custom404Title.length > 0) {
        return NextResponse.json(
          { error: `${t.validationFieldName404Title}：${t.validationContainsDisallowedContent}` },
          { status: 400 }
        )
      }
      cleanedData.custom404Title = cleaned || '404' // 使用預設值如果為空
    }

    if (validatedData.custom404Description !== undefined) {
      const cleaned = sanitizeText(validatedData.custom404Description)
      if (cleaned.length === 0 && validatedData.custom404Description.length > 0) {
        return NextResponse.json(
          { error: `${t.validationFieldName404Description}：${t.validationContainsDisallowedContent}` },
          { status: 400 }
        )
      }
      cleanedData.custom404Description = cleaned || (lang === 'zh-TW' ? '您尋找的短連結不存在或可能已被移除。' : 'The short link you are looking for does not exist or may have been removed.')
    }

    if (validatedData.custom404ButtonText !== undefined) {
      const cleaned = sanitizeText(validatedData.custom404ButtonText)
      if (cleaned.length === 0 && validatedData.custom404ButtonText.length > 0) {
        return NextResponse.json(
          { error: `${t.validationFieldName404ButtonText}：${t.validationContainsDisallowedContent}` },
          { status: 400 }
        )
      }
      cleanedData.custom404ButtonText = cleaned || (lang === 'zh-TW' ? '返回首頁' : 'Back to Home')
    }

    // 清理和驗證 URL
    if (validatedData.custom404ButtonUrl) {
      const sanitizedUrl = sanitizeUrl(validatedData.custom404ButtonUrl)
      if (!sanitizedUrl) {
        return NextResponse.json(
          { error: `${t.validationFieldName404ButtonUrl}：${t.validationButtonUrlInvalid}` },
          { status: 400 }
        )
      }
      cleanedData.custom404ButtonUrl = sanitizedUrl
    }

    // 取得第一個設定記錄或建立新的
    let settings = await db.setting.findFirst()

    if (settings) {
      settings = await db.setting.update({
        where: { id: settings.id },
        data: cleanedData
      })
    } else {
      settings = await db.setting.create({
        data: {
          logoUrl: cleanedData.logoUrl ?? null,
          defaultQrStyle: cleanedData.defaultQrStyle ?? 'square',
          custom404Title: cleanedData.custom404Title ?? '404',
          custom404Description: cleanedData.custom404Description ?? '您尋找的短連結不存在或可能已被移除。',
          custom404ButtonText: cleanedData.custom404ButtonText ?? '返回首頁',
          custom404ButtonUrl: cleanedData.custom404ButtonUrl ?? '/'
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

