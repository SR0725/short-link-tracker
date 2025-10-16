/**
 * 清理文字輸入，移除所有 HTML 標籤和潛在的惡意內容
 * 用於處理一般文字欄位，如標題、描述等
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return ''

  // 分步驟清理，確保保留文字內容
  let cleaned = input
    // 1. 先移除危險標籤及其內容（這些標籤的內容通常是惡意程式碼）
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // 2. 移除其他 HTML 標籤（但保留內容）
    .replace(/<[^>]+>/g, '')
    // 3. 移除危險協定和事件處理器
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // 4. 解碼 HTML 實體（如果有）
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')

  // 再次清理可能解碼後出現的標籤
  cleaned = cleaned
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')

  // 移除多餘的空白和換行
  return cleaned.trim()
}

/**
 * 清理和驗證 URL
 * 確保 URL 格式正確且不包含危險協定（如 javascript:, data:, vbscript: 等）
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null

  const trimmedUrl = url.trim()

  // 空字串視為 null
  if (!trimmedUrl) return null

  try {
    const parsedUrl = new URL(trimmedUrl)

    // 只允許安全的協定
    const allowedProtocols = ['http:', 'https:']

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      console.warn(`Blocked dangerous URL protocol: ${parsedUrl.protocol}`)
      return null
    }

    // 返回標準化的 URL
    return parsedUrl.toString()
  } catch {
    // 如果是相對路徑（如 /admin, /home），則允許
    if (trimmedUrl.startsWith('/')) {
      // 清理路徑中的危險字元，移除 HTML 標籤和特殊字元
      const cleanedPath = trimmedUrl
        .replace(/<[^>]+>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
      return cleanedPath
    }

    console.warn(`Invalid URL format: ${trimmedUrl}`)
    return null
  }
}

/**
 * 清理可能包含有限 HTML 的內容
 * 僅允許安全的 HTML 標籤和屬性
 * 適用於需要支援基本格式的文字內容
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''

  // 移除危險標籤和屬性
  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')

  return cleaned.trim()
}

/**
 * 清理標籤（tag）輸入
 * 只允許字母、數字、連字號和底線
 */
export function sanitizeTag(tag: string | null | undefined): string | null {
  if (!tag) return null

  const trimmed = tag.trim()
  if (!trimmed) return null

  // 移除所有非字母數字、連字號、底線和空格的字元
  const cleaned = trimmed.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_\s]/g, '')

  // 限制長度
  const maxLength = 50
  return cleaned.substring(0, maxLength)
}

/**
 * 清理短網址 slug
 * 只允許字母、數字和連字號
 */
export function sanitizeSlug(slug: string | null | undefined): string | undefined {
  if (!slug) return undefined

  const trimmed = slug.trim()
  if (!trimmed) return undefined

  // 只允許字母、數字和連字號
  const cleaned = trimmed.replace(/[^a-zA-Z0-9\-_]/g, '')

  // 限制長度
  const maxLength = 100
  const result = cleaned.substring(0, maxLength)
  return result || undefined
}

/**
 * 驗證和清理 base64 圖片資料
 * 檢查格式是否正確
 */
export function sanitizeBase64Image(dataUrl: string | null | undefined): string | null {
  if (!dataUrl) return null

  const trimmed = dataUrl.trim()
  if (!trimmed) return null

  // 檢查是否為有效的 data URL 格式
  const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/

  if (!dataUrlPattern.test(trimmed)) {
    console.warn('Invalid base64 image format')
    return null
  }

  // 檢查 base64 部分是否有效
  try {
    const base64Part = trimmed.split(',')[1]
    if (!base64Part) return null

    // 驗證 base64 格式
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/
    if (!base64Pattern.test(base64Part)) {
      console.warn('Invalid base64 encoding')
      return null
    }

    return trimmed
  } catch (error) {
    console.warn('Error validating base64 image:', error)
    return null
  }
}
