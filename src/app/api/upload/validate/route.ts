import { NextRequest, NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth'
import { validateImage } from '@/lib/image-validator'
import { imageUploadSchema, validateInput } from '@/lib/validation'

/**
 * 圖片上傳驗證 API
 * 驗證圖片格式、大小，並清理 SVG 內容
 */
export async function POST(request: NextRequest) {
  try {
    // 檢查權限
    const isAuthenticated = await getAuthStatus()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 驗證請求格式
    const validationResult = validateInput(imageUploadSchema, body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          valid: false,
          error: validationResult.error
        },
        { status: 400 }
      )
    }

    const { dataUrl } = validationResult.data

    // 驗證圖片
    const imageValidation = await validateImage(dataUrl)

    if (!imageValidation.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: imageValidation.error || 'Image validation failed'
        },
        { status: 400 }
      )
    }

    // 返回驗證成功，以及清理後的資料（特別是 SVG）
    return NextResponse.json({
      valid: true,
      mimeType: imageValidation.mimeType,
      size: imageValidation.size,
      cleanedDataUrl: imageValidation.cleanedDataUrl
    })
  } catch (error) {
    console.error('Image validation error:', error)
    return NextResponse.json(
      {
        valid: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
