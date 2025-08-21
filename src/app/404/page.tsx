'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

interface Settings {
  custom404Title: string
  custom404Description: string
  custom404ButtonText: string
  custom404ButtonUrl: string
  logoUrl?: string
}

export default function NotFoundPage() {
  const [settings, setSettings] = useState<Settings>({
    custom404Title: '404',
    custom404Description: '您尋找的短連結不存在或可能已被移除。',
    custom404ButtonText: '返回首頁',
    custom404ButtonUrl: '/'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 載入個人化設定
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        setSettings({
          custom404Title: data.custom404Title || '404',
          custom404Description: data.custom404Description || '您尋找的短連結不存在或可能已被移除。',
          custom404ButtonText: data.custom404ButtonText || '返回首頁',
          custom404ButtonUrl: data.custom404ButtonUrl || '/',
          logoUrl: data.logoUrl
        })
      })
      .catch(error => {
        console.error('Failed to load settings:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div>載入中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="space-y-4">
            {settings.logoUrl && (
              <div className="flex justify-center">
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            )}
            <CardTitle className="text-6xl font-bold text-gray-300 dark:text-gray-600">
              {settings.custom404Title}
            </CardTitle>
            <CardDescription className="text-lg">
              找不到短連結
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {settings.custom404Description}
          </p>
          <Button asChild>
            <Link href={settings.custom404ButtonUrl}>
              <Home className="w-4 h-4 mr-2" />
              {settings.custom404ButtonText}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}