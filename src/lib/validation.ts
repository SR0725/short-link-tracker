import { z } from 'zod'
import { translations, type Language } from './i18n'

/**
 * 設定驗證 schema
 * 用於驗證 404 頁面和網站設定
 */
export const settingsSchema = z.object({
  logoUrl: z.string().optional().nullable().refine(
    (val) => {
      if (!val) return true
      // 允許 data URL 或 http/https URL
      return val.startsWith('data:image/') || val.startsWith('http://') || val.startsWith('https://')
    },
    { message: 'Logo URL must be a valid data URL or HTTP(S) URL' }
  ),
  defaultQrStyle: z.enum(['square', 'rounded', 'dots']).optional(),
  custom404Title: z.string().min(1, '標題不能為空').max(100, '標題最多 100 字元').optional(),
  custom404Description: z.string().min(1, '描述不能為空').max(500, '描述最多 500 字元').optional(),
  custom404ButtonText: z.string().min(1, '按鈕文字不能為空').max(50, '按鈕文字最多 50 字元').optional(),
  custom404ButtonUrl: z.string().min(1).max(500).optional().refine(
    (val) => {
      if (!val) return true
      // 允許相對路徑或完整 URL
      if (val.startsWith('/')) return true
      try {
        const url = new URL(val)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    },
    { message: 'Button URL must be a valid relative path or HTTP(S) URL' }
  )
})

export type SettingsInput = z.infer<typeof settingsSchema>

/**
 * 短連結建立驗證 schema
 */
export const linkSchema = z.object({
  targetUrl: z.string().min(1, '目標網址為必填').refine(
    (val) => {
      try {
        const url = new URL(val)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    },
    { message: '請輸入有效的網址（必須以 http:// 或 https:// 開頭）' }
  ),
  customSlug: z.string().optional().nullable().refine(
    (val) => {
      if (!val) return true
      // 只允許字母、數字、連字號和底線
      return /^[a-zA-Z0-9\-_]+$/.test(val)
    },
    { message: '只能包含英文字母、數字、連字號和底線' }
  ),
  title: z.string().max(200, '標題最多 200 字元').optional().nullable(),
  tag: z.string().max(50, '標籤最多 50 字元').optional().nullable(),
  expiresAt: z.string().optional().nullable().refine(
    (val) => {
      if (!val) return true
      try {
        const date = new Date(val)
        return !isNaN(date.getTime())
      } catch {
        return false
      }
    },
    { message: '日期時間格式不正確' }
  ),
  clickLimit: z.union([
    z.string().regex(/^\d+$/).transform(Number),
    z.number()
  ]).optional().nullable()
})

export type LinkInput = z.infer<typeof linkSchema>

/**
 * 標籤驗證 schema
 */
export const tagSchema = z.object({
  tag: z.string().min(1).max(50).refine(
    (val) => {
      // 允許字母、數字、中文、連字號、底線和空格
      return /^[a-zA-Z0-9\u4e00-\u9fa5\-_\s]+$/.test(val)
    },
    { message: 'Tag can only contain letters, numbers, Chinese characters, hyphens, underscores, and spaces' }
  )
})

export type TagInput = z.infer<typeof tagSchema>

/**
 * 圖片上傳驗證 schema
 */
export const imageUploadSchema = z.object({
  dataUrl: z.string().min(1, 'Image data is required').refine(
    (val) => {
      // 檢查是否為有效的 data URL
      return /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/.test(val)
    },
    { message: 'Invalid image data format' }
  ),
  maxSizeBytes: z.number().optional().default(2 * 1024 * 1024) // 預設 2MB
})

export type ImageUploadInput = z.infer<typeof imageUploadSchema>

/**
 * 取得欄位的本地化名稱
 */
function getFieldName(fieldName: string, lang: Language): string {
  const t = translations[lang]
  const fieldNameMap: Record<string, string> = {
    'custom404Title': t.validationFieldName404Title,
    'custom404Description': t.validationFieldName404Description,
    'custom404ButtonText': t.validationFieldName404ButtonText,
    'custom404ButtonUrl': t.validationFieldName404ButtonUrl,
    'logoUrl': t.validationFieldNameLogoUrl,
    'targetUrl': t.validationFieldNameTargetUrl,
    'customSlug': t.validationFieldNameCustomSlug,
    'title': t.validationFieldNameTitle,
    'tag': t.validationFieldNameTag,
    'expiresAt': t.validationFieldNameExpiresAt,
    'clickLimit': t.validationFieldNameClickLimit
  }
  return fieldNameMap[fieldName] || fieldName
}

/**
 * 取得驗證錯誤訊息的翻譯
 */
function getValidationMessage(message: string, lang: Language): string {
  const t = translations[lang]

  // 根據錯誤訊息的關鍵字來匹配對應的翻譯
  const messageMap: Record<string, string> = {
    'Logo URL must be a valid data URL or HTTP(S) URL': t.validationLogoUrlInvalid,
    'Button URL must be a valid relative path or HTTP(S) URL': t.validationButtonUrlInvalid,
    '標題不能為空': t.validationTitleEmpty,
    '標題最多 100 字元': t.validationTitleMaxLength,
    '描述不能為空': t.validationDescriptionEmpty,
    '描述最多 500 字元': t.validationDescriptionMaxLength,
    '按鈕文字不能為空': t.validationButtonTextEmpty,
    '按鈕文字最多 50 字元': t.validationButtonTextMaxLength,
    '目標網址為必填': t.validationTargetUrlRequired,
    '請輸入有效的網址（必須以 http:// 或 https:// 開頭）': t.validationTargetUrlInvalid,
    '只能包含英文字母、數字、連字號和底線': t.validationCustomSlugInvalid,
    '標題最多 200 字元': t.validationTitleMaxLength200,
    '標籤最多 50 字元': t.validationTagMaxLength50,
    '日期時間格式不正確': t.validationDateTimeInvalid,
    'Tag can only contain letters, numbers, Chinese characters, hyphens, underscores, and spaces': t.validationTagInvalid,
    'Image data is required': t.validationImageRequired,
    'Invalid image data format': t.validationImageFormatInvalid
  }

  return messageMap[message] || message
}

/**
 * 驗證輸入並返回清理後的資料
 * @param schema - Zod schema
 * @param data - 要驗證的資料
 * @param lang - 語言（預設為 zh-TW）
 * @returns 驗證和清理後的資料，或錯誤訊息
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  lang: Language = 'zh-TW'
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // 處理驗證錯誤，生成本地化的友善訊息
  const errorMessages = result.error.issues.map((issue) => {
    const fieldName = issue.path[0] as string
    const friendlyName = getFieldName(fieldName, lang)
    const message = getValidationMessage(issue.message, lang)

    return `${friendlyName}：${message}`
  }).join('、')

  return { success: false, error: errorMessages }
}
