import { NextRequest } from 'next/server'
import { Language, DEFAULT_LANGUAGE, LANGUAGE_QUERY_PARAM } from './config'

/**
 * 從 API request 中獲取用戶的語言偏好
 * 優先級：query parameter > Accept-Language header > 預設語言
 */
export function getLanguageFromRequest(request: NextRequest): Language {
  // 1. 檢查 query parameter
  const langParam = request.nextUrl.searchParams.get(LANGUAGE_QUERY_PARAM)
  if (langParam === 'en' || langParam === 'zh-TW') {
    return langParam as Language
  }

  // 2. 檢查 Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language')
  if (acceptLanguage) {
    // Parse Accept-Language header (format: "en-US,en;q=0.9,zh-TW;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, qValue] = lang.trim().split(';q=')
        return {
          code: code.trim(),
          quality: qValue ? parseFloat(qValue) : 1.0
        }
      })
      .sort((a, b) => b.quality - a.quality)

    // 尋找支援的語言
    for (const lang of languages) {
      if (lang.code.startsWith('en')) {
        return 'en'
      }
      if (lang.code.startsWith('zh-TW') || lang.code === 'zh-Hant') {
        return 'zh-TW'
      }
    }
  }

  // 3. 返回預設語言
  return DEFAULT_LANGUAGE
}
