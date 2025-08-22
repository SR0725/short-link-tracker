'use client'

import { useState, useRef, useEffect } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Download, Upload, Palette, Shapes, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface QRCodeGeneratorProps {
  url: string
  defaultStyle?: 'square' | 'rounded' | 'dots'
  defaultColorScheme?: string
}

type QRStyle = 'square' | 'rounded' | 'dots'
type ColorScheme = {
  id: string
  name: string
  foreground: string
  background: string
  accent?: string
}

const colorSchemes: ColorScheme[] = [
  { id: 'classic', name: '經典黑白', foreground: '#000000', background: '#ffffff' },
  { id: 'blue', name: '商務藍', foreground: '#1e40af', background: '#f0f9ff', accent: '#3b82f6' },
  { id: 'green', name: '自然綠', foreground: '#166534', background: '#f0fdf4', accent: '#22c55e' },
  { id: 'purple', name: '紫羅蘭', foreground: '#7c3aed', background: '#faf5ff', accent: '#a855f7' },
  { id: 'red', name: '活力紅', foreground: '#dc2626', background: '#fef2f2', accent: '#ef4444' },
  { id: 'orange', name: '橘色暖陽', foreground: '#ea580c', background: '#fff7ed', accent: '#f97316' },
  { id: 'teal', name: '青綠色', foreground: '#0f766e', background: '#f0fdfa', accent: '#14b8a6' },
  { id: 'pink', name: '粉紅色', foreground: '#be185d', background: '#fdf2f8', accent: '#ec4899' }
]

export function QRCodeGenerator({ url, defaultStyle = 'square', defaultColorScheme = 'classic' }: QRCodeGeneratorProps) {
  const [style, setStyle] = useState<QRStyle>(defaultStyle)
  const [colorScheme, setColorScheme] = useState(defaultColorScheme)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [, setLogoFile] = useState<File | null>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrCode = useRef<QRCodeStyling | null>(null)

  // Initialize QR Code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      qrCode.current = new QRCodeStyling({
        width: 200,
        height: 200,
        margin: 10,
        data: url
      })
    }
  }, [])

  // Load default settings
  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl)
        }
        if (data.defaultQrStyle) {
          setStyle(data.defaultQrStyle as QRStyle)
        }
      })
      .catch(console.error)
  }, [url])

  // Update QR Code when style, color, or URL changes
  useEffect(() => {
    if (qrCodeRef.current && typeof window !== 'undefined') {
      const selectedColorScheme = colorSchemes.find(cs => cs.id === colorScheme) || colorSchemes[0]
      const options = getQRCodeOptions(style, selectedColorScheme, logoUrl)
      
      // Recreate QR code instance to ensure proper logo handling
      qrCode.current = new QRCodeStyling({
        ...options,
        data: url
      })
      
      // Clear previous QR code
      qrCodeRef.current.innerHTML = ''
      // Append new QR code
      qrCode.current.append(qrCodeRef.current)
    }
  }, [url, style, colorScheme, logoUrl])

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 檢查檔案大小（限制 2MB）
      if (file.size > 2 * 1024 * 1024) {
        toast.error('檔案大小不得超過 2MB')
        return
      }

      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoUrl(e.target?.result as string)
        toast.success('Logo 已上傳')
      }
      reader.readAsDataURL(file)
    }
  }

  const downloadQR = (format: 'png' | 'svg' = 'png') => {
    if (!qrCode.current) {
      toast.error('QR Code 尚未生成')
      return
    }

    try {
      if (format === 'png') {
        qrCode.current.download({ name: `qrcode-${Date.now()}`, extension: 'png' })
        toast.success('QR Code 已下載')
      } else if (format === 'svg') {
        qrCode.current.download({ name: `qrcode-${Date.now()}`, extension: 'svg' })
        toast.success('QR Code 已下載')
      }
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('下載失敗')
    }
  }

  const copyQR = async () => {
    if (!qrCode.current) {
      toast.error('QR Code 尚未生成')
      return
    }

    try {
      const canvas = document.createElement('canvas')
      await qrCode.current.getRawData('png').then(data => {
        if (data) {
          // Convert Buffer to Blob if needed
          let blob: Blob
          if (data instanceof Blob) {
            blob = data
          } else {
            // Handle Buffer case
            const uint8Array = new Uint8Array(data)
            blob = new Blob([uint8Array], { type: 'image/png' })
          }
          const item = new ClipboardItem({ 'image/png': blob })
          navigator.clipboard.write([item]).then(() => {
            toast.success('QR Code 已複製到剪貼簿')
          }).catch(() => {
            toast.error('複製失敗，請嘗試下載')
          })
        }
      })
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('複製失敗，請嘗試下載')
    }
  }

  // QR Code configuration based on style and color scheme
  const getQRCodeOptions = (qrStyle: QRStyle, colors: ColorScheme, logo: string | null) => {
    const baseOptions = {
      width: 200,
      height: 200,
      margin: 10,
      qrOptions: {
        typeNumber: 0 as const,
        mode: 'Byte' as const,
        errorCorrectionLevel: 'M' as const
      },
      ...(logo && {
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          crossOrigin: 'anonymous' as const,
          margin: 0
        },
        image: logo
      })
    }

    switch (qrStyle) {
      case 'rounded':
        return {
          ...baseOptions,
          dotsOptions: {
            color: colors.foreground,
            type: 'rounded' as const
          },
          backgroundOptions: {
            color: colors.background
          },
          cornersSquareOptions: {
            color: colors.accent || colors.foreground,
            type: 'extra-rounded' as const
          },
          cornersDotOptions: {
            color: colors.accent || colors.foreground,
            type: 'dot' as const
          }
        }
      case 'dots':
        return {
          ...baseOptions,
          dotsOptions: {
            color: colors.foreground,
            type: 'dots' as const
          },
          backgroundOptions: {
            color: colors.background
          },
          cornersSquareOptions: {
            color: colors.accent || colors.foreground,
            type: 'extra-rounded' as const
          },
          cornersDotOptions: {
            color: colors.accent || colors.foreground,
            type: 'dot' as const
          }
        }
      default: // square
        return {
          ...baseOptions,
          dotsOptions: {
            color: colors.foreground,
            type: 'square' as const
          },
          backgroundOptions: {
            color: colors.background
          },
          cornersSquareOptions: {
            color: colors.accent || colors.foreground,
            type: 'square' as const
          },
          cornersDotOptions: {
            color: colors.accent || colors.foreground,
            type: 'square' as const
          }
        }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">QR Code 生成器</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code 預覽 */}
        <div className="flex justify-center">
          <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg bg-white">
            <div ref={qrCodeRef} className="flex justify-center" />
          </div>
        </div>

        {/* 樣式和顏色選擇 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* QR Code 樣式 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shapes className="w-4 h-4" />
              QR Code 樣式
            </Label>
            <Select value={style} onValueChange={(value: QRStyle) => setStyle(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">方形（傳統）</SelectItem>
                <SelectItem value="rounded">圓角方形</SelectItem>
                <SelectItem value="dots">圓點樣式</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 顏色方案 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              QR Code 色系
            </Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorSchemes.map(scheme => (
                  <SelectItem key={scheme.id} value={scheme.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: scheme.foreground }}
                      />
                      {scheme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Style and Color Preview Grid */}
        <div className="space-y-3">
          <Label>預覽所有組合</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border rounded-lg bg-gray-50">
            {colorSchemes.map(scheme => (
              <div key={scheme.id} className="space-y-2">
                <div className="text-xs text-center font-medium text-gray-600">
                  {scheme.name}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['square', 'rounded', 'dots'] as QRStyle[]).map(styleType => (
                    <div
                      key={`${scheme.id}-${styleType}`}
                      className={`w-16 h-16 border rounded cursor-pointer transition-all hover:scale-105 ${
                        style === styleType && colorScheme === scheme.id
                          ? 'ring-2 ring-blue-500 border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setStyle(styleType)
                        setColorScheme(scheme.id)
                      }}
                      title={`${scheme.name} - ${styleType === 'square' ? '方形' : styleType === 'rounded' ? '圓角' : '圓點'}`}
                    >
                      <QRPreview 
                        url={url} 
                        style={styleType} 
                        colorScheme={scheme}
                        size={60}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logo 上傳 */}
        <div className="space-y-2">
          <Label>中央 Logo（選用）</Label>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              上傳 Logo
            </Button>
            {logoUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLogoUrl(null)
                  setLogoFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                  toast.success('Logo 已移除')
                }}
              >
                移除
              </Button>
            )}
          </div>
          {logoUrl && (
            <div className="flex justify-center">
              <img src={logoUrl} alt="Logo preview" className="w-10 h-10 object-contain border rounded" />
            </div>
          )}
        </div>

        {/* 下載和複製按鈕 */}
        <div className="flex gap-2">
          <Button onClick={copyQR} variant="outline" className="flex-1">
            <Copy className="w-4 h-4 mr-2" />
            複製圖片
          </Button>
          <Button onClick={() => downloadQR('png')} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            下載 PNG
          </Button>
          <Button onClick={() => downloadQR('svg')} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            下載 SVG
          </Button>
        </div>

        <div className="text-sm text-gray-500 text-center">
          掃描此 QR Code 將跳轉到: {url}
        </div>
      </CardContent>
    </Card>
  )
}

// Mini QR Code Preview Component
function QRPreview({ url, style, colorScheme, size = 60 }: {
  url: string
  style: QRStyle
  colorScheme: ColorScheme
  size?: number
}) {
  const previewRef = useRef<HTMLDivElement>(null)
  const previewQR = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && previewRef.current) {
      // Create mini QR code
      previewQR.current = new QRCodeStyling({
        width: size,
        height: size,
        margin: 2,
        data: url,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'M'
        }
      })

      // Configure based on style
      const options = getPreviewQROptions(style, colorScheme, size)
      previewQR.current.update(options)

      // Clear and append
      previewRef.current.innerHTML = ''
      previewQR.current.append(previewRef.current)
    }
  }, [url, style, colorScheme, size])

  const getPreviewQROptions = (qrStyle: QRStyle, colors: ColorScheme, qrSize: number) => {
    const baseOptions = {
      width: qrSize,
      height: qrSize,
      margin: 2
    }

    switch (qrStyle) {
      case 'rounded':
        return {
          ...baseOptions,
          dotsOptions: {
            color: colors.foreground,
            type: 'rounded' as const
          },
          backgroundOptions: {
            color: colors.background
          },
          cornersSquareOptions: {
            color: colors.accent || colors.foreground,
            type: 'extra-rounded' as const
          },
          cornersDotOptions: {
            color: colors.accent || colors.foreground,
            type: 'dot' as const
          }
        }
      case 'dots':
        return {
          ...baseOptions,
          dotsOptions: {
            color: colors.foreground,
            type: 'dots' as const
          },
          backgroundOptions: {
            color: colors.background
          },
          cornersSquareOptions: {
            color: colors.accent || colors.foreground,
            type: 'extra-rounded' as const
          },
          cornersDotOptions: {
            color: colors.accent || colors.foreground,
            type: 'dot' as const
          }
        }
      default: // square
        return {
          ...baseOptions,
          dotsOptions: {
            color: colors.foreground,
            type: 'square' as const
          },
          backgroundOptions: {
            color: colors.background
          },
          cornersSquareOptions: {
            color: colors.accent || colors.foreground,
            type: 'square' as const
          },
          cornersDotOptions: {
            color: colors.accent || colors.foreground,
            type: 'square' as const
          }
        }
    }
  }

  return <div ref={previewRef} className="flex justify-center items-center w-full h-full" />
}