'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  const t = useTranslations('notFound')
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-gray-300 dark:text-gray-600">{t('title')}</CardTitle>
          <CardDescription className="text-lg">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('description')}
          </p>
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              {t('goHome')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}