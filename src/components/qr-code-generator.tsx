'use client'

import { useState, useRef, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Download, Upload } from 'lucide-react'

interface QRCodeGeneratorProps {
  url: string
  defaultStyle?: string
}

export function QRCodeGenerator({ url, defaultStyle = 'square' }: QRCodeGeneratorProps) {
  const [style, setStyle] = useState(defaultStyle)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [, setLogoFile] = useState<File | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 載入預設 logo 設定
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl)
        }
        if (data.defaultQrStyle) {
          setStyle(data.defaultQrStyle)
        }
      })
      .catch(console.error)
  }, [])

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const downloadQR = (format: 'png' | 'svg' = 'png') => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (format === 'png') {
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
    // SVG download would require additional implementation
  }

  // QR Code styles configuration
  const getQRCodeProps = () => {
    const baseProps = {
      value: url,
      size: 200,
      level: 'M' as const,
      includeMargin: true
    }

    switch (style) {
      case 'rounded':
        return {
          ...baseProps,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
          imageSettings: logoUrl ? {
            src: logoUrl,
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true
          } : undefined
        }
      case 'dots':
        return {
          ...baseProps,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
          imageSettings: logoUrl ? {
            src: logoUrl,
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true
          } : undefined
        }
      default: // square
        return {
          ...baseProps,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
          imageSettings: logoUrl ? {
            src: logoUrl,
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true
          } : undefined
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
          <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg">
            <QRCodeCanvas 
              {...getQRCodeProps()}
              ref={canvasRef}
            />
          </div>
        </div>

        {/* 樣式選擇 */}
        <div className="space-y-2">
          <Label>QR Code 樣式</Label>
          <Select value={style} onValueChange={setStyle}>
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

        {/* 下載按鈕 */}
        <div className="flex gap-2">
          <Button onClick={() => downloadQR('png')} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            下載 PNG
          </Button>
          {/* <Button onClick={() => downloadQR('svg')} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            下載 SVG
          </Button> */}
        </div>

        <div className="text-sm text-gray-500 text-center">
          掃描此 QR Code 將跳轉到: {url}
        </div>
      </CardContent>
    </Card>
  )
}