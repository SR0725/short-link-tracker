'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Upload, Trash2, Home } from 'lucide-react'

interface Settings {
  id?: string
  logoUrl?: string
  defaultQrStyle: string
  custom404Title: string
  custom404Description: string
  custom404ButtonText: string
  custom404ButtonUrl: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    defaultQrStyle: 'square',
    custom404Title: '404',
    custom404Description: '您尋找的短連結不存在或可能已被移除。',
    custom404ButtonText: '返回首頁',
    custom404ButtonUrl: '/'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      
      // 預覽圖片
      const reader = new FileReader()
      reader.onload = (e) => {
        setSettings(prev => ({
          ...prev,
          logoUrl: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      let logoUrl = settings.logoUrl

      // 如果有新上傳的 logo，先上傳檔案（這裡簡化處理，實際應該上傳到雲端儲存）
      if (logoFile) {
        // 實際專案中應該上傳到 S3/Cloudinary 等服務
        // 這裡暫時使用 base64 data URL
        logoUrl = settings.logoUrl
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logoUrl,
          defaultQrStyle: settings.defaultQrStyle,
          custom404Title: settings.custom404Title,
          custom404Description: settings.custom404Description,
          custom404ButtonText: settings.custom404ButtonText,
          custom404ButtonUrl: settings.custom404ButtonUrl
        }),
      })

      if (response.ok) {
        setMessage('設定已儲存！')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await response.json()
        setMessage(data.error || '儲存失敗')
      }
    } catch (error) {
      console.error('Save settings error:', error)
      setMessage('網路錯誤，請重試')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logoUrl: undefined }))
    setLogoFile(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>載入中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回儀表板
          </Button>
          <div>
            <h1 className="text-3xl font-bold">個人化設定</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              自訂您的短網址服務外觀和行為
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Logo 設定 */}
          <Card>
            <CardHeader>
              <CardTitle>Logo 設定</CardTitle>
              <CardDescription>
                設定在 QR Code 中央顯示的 Logo 圖片
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo 圖片</Label>
                <div className="flex gap-4 items-center">
                  {settings.logoUrl && (
                    <div className="relative">
                      <img 
                        src={settings.logoUrl} 
                        alt="Logo" 
                        className="w-20 h-20 object-contain border-2 border-gray-200 rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                        onClick={handleRemoveLogo}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      建議尺寸：100x100 像素，PNG/JPG 格式
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code 預設樣式 */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code 預設樣式</CardTitle>
              <CardDescription>
                選擇新建立短網址時的預設 QR Code 樣式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>預設樣式</Label>
                <Select 
                  value={settings.defaultQrStyle} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, defaultQrStyle: value }))}
                >
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
            </CardContent>
          </Card>

          {/* 404 頁面個人化 */}
          <Card>
            <CardHeader>
              <CardTitle>404 頁面個人化</CardTitle>
              <CardDescription>
                自訂當短連結不存在或過期時顯示的頁面內容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="404-title">標題</Label>
                  <Input
                    id="404-title"
                    value={settings.custom404Title}
                    onChange={(e) => setSettings(prev => ({ ...prev, custom404Title: e.target.value }))}
                    placeholder="404"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="404-button-text">按鈕文字</Label>
                  <Input
                    id="404-button-text"
                    value={settings.custom404ButtonText}
                    onChange={(e) => setSettings(prev => ({ ...prev, custom404ButtonText: e.target.value }))}
                    placeholder="返回首頁"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="404-description">描述文字</Label>
                <Textarea
                  id="404-description"
                  value={settings.custom404Description}
                  onChange={(e) => setSettings(prev => ({ ...prev, custom404Description: e.target.value }))}
                  placeholder="您尋找的短連結不存在或可能已被移除。"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="404-button-url">按鈕連結</Label>
                <Input
                  id="404-button-url"
                  value={settings.custom404ButtonUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, custom404ButtonUrl: e.target.value }))}
                  placeholder="/"
                />
              </div>

              {/* 404 頁面預覽 */}
              <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="font-medium mb-2">預覽</h3>
                <div className="text-center space-y-2 py-4">
                  {settings.logoUrl && (
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo" 
                      className="w-12 h-12 object-contain mx-auto"
                    />
                  )}
                  <div className="text-4xl font-bold text-gray-300">
                    {settings.custom404Title}
                  </div>
                  <p className="text-gray-600">
                    {settings.custom404Description}
                  </p>
                  <Button size="sm" disabled>
                    <Home className="w-3 h-3 mr-1" />
                    {settings.custom404ButtonText}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 儲存按鈕 */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '儲存中...' : '儲存設定'}
            </Button>
          </div>

          {/* 訊息顯示 */}
          {message && (
            <div className={`text-center p-3 rounded-lg ${
              message.includes('成功') || message.includes('儲存') 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}