'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Upload, Trash2, Home, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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
      // 檢查檔案大小（限制 2MB）
      if (file.size > 2 * 1024 * 1024) {
        toast.error('檔案大小不得超過 2MB')
        return
      }

      setLogoFile(file)
      
      // 預覽圖片
      const reader = new FileReader()
      reader.onload = (e) => {
        setSettings(prev => ({
          ...prev,
          logoUrl: e.target?.result as string
        }))
        toast.success('Logo 已上傳')
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
        toast.success('設定已儲存！')
        setMessage('')
      } else {
        const data = await response.json()
        const errorMsg = data.error || '儲存失敗'
        setMessage(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Save settings error:', error)
      const errorMsg = '網路錯誤，請重試'
      setMessage(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logoUrl: undefined }))
    setLogoFile(null)
    toast.success('Logo 已移除')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Settings className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-xl font-medium text-black">載入設定中...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/admin')}
                className="border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回儀表板
              </Button>
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tight">
                      設定中心
                    </h1>
                    <p className="text-xl text-gray-600 mt-1">
                      打造專屬的短網址體驗
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-8">
            {/* Logo 設定 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl font-bold text-black">
                    <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center mr-3">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    Logo 設定
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-lg">
                    設定在 QR Code 中央顯示的 Logo 圖片
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-gray-900">Logo 圖片</Label>
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      {settings.logoUrl && (
                        <motion.div 
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="relative mx-auto sm:mx-0"
                        >
                          <img 
                            src={settings.logoUrl} 
                            alt="Logo" 
                            className="w-24 h-24 object-contain border-2 border-gray-200 rounded-2xl bg-gray-50"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-8 h-8 p-0 rounded-full"
                            onClick={handleRemoveLogo}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
                      <div className="flex-1 w-full space-y-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className=" file:h-full text-base border-gray-300 focus:border-black focus:ring-black file:mr-4 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                        />
                        <p className="text-base text-gray-600">
                          建議尺寸：100x100 像素，PNG/JPG 格式，檔案大小不超過 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* QR Code 預設樣式 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl font-bold text-black">
                    <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center mr-3">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    QR Code 預設樣式
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-lg">
                    選擇新建立短網址時的預設 QR Code 樣式
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-gray-900">預設樣式</Label>
                    <Select 
                      value={settings.defaultQrStyle} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, defaultQrStyle: value }))}
                    >
                      <SelectTrigger className="h-14 text-base border-gray-300 focus:border-black focus:ring-black">
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
            </motion.div>

            {/* 404 頁面個人化 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl font-bold text-black">
                    <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center mr-3">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    404 頁面個人化
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-lg">
                    自訂當短連結不存在或過期時顯示的頁面內容
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="404-title" className="text-base font-semibold text-gray-900">標題</Label>
                      <Input
                        id="404-title"
                        value={settings.custom404Title}
                        onChange={(e) => setSettings(prev => ({ ...prev, custom404Title: e.target.value }))}
                        placeholder="404"
                        className="h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="404-button-text" className="text-base font-semibold text-gray-900">按鈕文字</Label>
                      <Input
                        id="404-button-text"
                        value={settings.custom404ButtonText}
                        onChange={(e) => setSettings(prev => ({ ...prev, custom404ButtonText: e.target.value }))}
                        placeholder="返回首頁"
                        className="h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="404-description" className="text-base font-semibold text-gray-900">描述文字</Label>
                    <Textarea
                      id="404-description"
                      value={settings.custom404Description}
                      onChange={(e) => setSettings(prev => ({ ...prev, custom404Description: e.target.value }))}
                      placeholder="您尋找的短連結不存在或可能已被移除。"
                      rows={4}
                      className="text-base border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="404-button-url" className="text-base font-semibold text-gray-900">按鈕連結</Label>
                    <Input
                      id="404-button-url"
                      value={settings.custom404ButtonUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, custom404ButtonUrl: e.target.value }))}
                      placeholder="/"
                      className="h-12 text-base border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  {/* 404 頁面預覽 */}
                  <div className="mt-8 p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                    <h3 className="text-lg font-semibold text-black mb-4">頁面預覽</h3>
                    <div className="text-center space-y-4 py-8 bg-white rounded-xl border border-gray-200">
                      {settings.logoUrl && (
                        <motion.img 
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          src={settings.logoUrl} 
                          alt="Logo" 
                          className="w-16 h-16 object-contain mx-auto"
                        />
                      )}
                      <div className="text-3xl sm:text-5xl font-black text-black">
                        {settings.custom404Title}
                      </div>
                      <p className="text-gray-700 text-base sm:text-lg px-4 max-w-md mx-auto">
                        {settings.custom404Description}
                      </p>
                      <Button size="lg" disabled className="bg-black text-white">
                        <Home className="w-4 h-4 mr-2" />
                        {settings.custom404ButtonText}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 儲存按鈕 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white h-16 px-12 text-lg font-semibold rounded-2xl min-w-[200px]"
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      />
                      儲存中...
                    </div>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-3" />
                      儲存設定
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            {/* 訊息顯示 */}
            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-center p-6 rounded-2xl text-lg font-medium ${
                  message.includes('成功') || message.includes('儲存') 
                    ? 'bg-green-50 text-green-800 border-2 border-green-200' 
                    : 'bg-red-50 text-red-800 border-2 border-red-200'
                }`}
              >
                {message}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}