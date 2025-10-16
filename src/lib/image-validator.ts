import { fileTypeFromBuffer } from 'file-type'

/**
 * 允許的圖片 MIME types
 */
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml'
] as const

/**
 * 最大檔案大小（2MB）
 */
const MAX_FILE_SIZE = 2 * 1024 * 1024

/**
 * 驗證圖片結果
 */
export interface ImageValidationResult {
  valid: boolean
  error?: string
  mimeType?: string
  size?: number
  cleanedDataUrl?: string
}

/**
 * 驗證 base64 圖片資料
 * @param dataUrl - base64 編碼的 data URL
 * @returns 驗證結果
 */
export async function validateImage(dataUrl: string): Promise<ImageValidationResult> {
  try {
    // 1. 檢查格式
    const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,(.+)$/
    const match = dataUrl.match(dataUrlPattern)

    if (!match) {
      return {
        valid: false,
        error: 'Invalid data URL format'
      }
    }

    const declaredMimeType = `image/${match[1]}`
    const base64Data = match[2]

    // 2. 檢查 base64 編碼是否有效
    let buffer: Buffer
    try {
      buffer = Buffer.from(base64Data, 'base64')
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid base64 encoding'
      }
    }

    // 3. 檢查檔案大小
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }

    // 4. 檢查實際的檔案類型（透過檔案頭）
    const fileType = await fileTypeFromBuffer(buffer)

    // SVG 是純文字檔案，file-type 無法檢測，需要特殊處理
    if (declaredMimeType === 'image/svg+xml') {
      const result = await validateSvg(buffer)
      return result
    }

    // 對於其他圖片格式，檢查實際 MIME type
    if (!fileType) {
      return {
        valid: false,
        error: 'Could not determine file type'
      }
    }

    if (!ALLOWED_IMAGE_TYPES.includes(fileType.mime as typeof ALLOWED_IMAGE_TYPES[number])) {
      return {
        valid: false,
        error: `File type ${fileType.mime} is not allowed`
      }
    }

    // 檢查宣告的 MIME type 是否與實際相符
    if (declaredMimeType !== fileType.mime) {
      return {
        valid: false,
        error: `Declared MIME type (${declaredMimeType}) does not match actual type (${fileType.mime})`
      }
    }

    return {
      valid: true,
      mimeType: fileType.mime,
      size: buffer.length,
      cleanedDataUrl: dataUrl
    }
  } catch (error) {
    console.error('Image validation error:', error)
    return {
      valid: false,
      error: 'Failed to validate image'
    }
  }
}

/**
 * 驗證和清理 SVG 檔案
 * SVG 可能包含 JavaScript 和其他危險內容
 */
async function validateSvg(buffer: Buffer): Promise<ImageValidationResult> {
  try {
    // 將 buffer 轉換為字串
    const svgContent = buffer.toString('utf-8')

    // 檢查是否真的是 SVG（基本檢查）
    if (!svgContent.trim().startsWith('<svg') && !svgContent.includes('<svg')) {
      return {
        valid: false,
        error: 'Not a valid SVG file'
      }
    }

    // 使用正則表達式清理 SVG，移除危險標籤和屬性
    const cleanedSvg = svgContent
      // 移除危險標籤
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '')
      // 移除事件處理器屬性
      .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')
      // 移除 javascript: 協定
      .replace(/javascript:/gi, '')

    // 檢查清理後的 SVG 是否仍然有效
    if (!cleanedSvg || cleanedSvg.trim().length === 0) {
      return {
        valid: false,
        error: 'SVG contains dangerous content and cannot be cleaned'
      }
    }

    // 將清理後的 SVG 重新編碼為 base64
    const cleanedBuffer = Buffer.from(cleanedSvg, 'utf-8')
    const cleanedBase64 = cleanedBuffer.toString('base64')
    const cleanedDataUrl = `data:image/svg+xml;base64,${cleanedBase64}`

    return {
      valid: true,
      mimeType: 'image/svg+xml',
      size: cleanedBuffer.length,
      cleanedDataUrl: cleanedDataUrl
    }
  } catch (error) {
    console.error('SVG validation error:', error)
    return {
      valid: false,
      error: 'Failed to validate SVG'
    }
  }
}

/**
 * 快速檢查圖片格式（不進行深度驗證）
 * 用於前端初步檢查
 */
export function quickValidateImageFormat(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: PNG, JPEG, GIF, WebP, SVG`
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  return { valid: true }
}
