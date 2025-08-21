import Link from "next/link"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Link as LinkIcon, Settings } from "lucide-react"
import { LanguageSwitcher } from '@/components/language-switcher'

export default function Home() {
  const t = useTranslations('home')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-4xl font-bold">
            <LinkIcon className="w-10 h-10 text-blue-600" />
            <span>{t('title')}</span>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <LinkIcon className="w-8 h-8 text-blue-600 mx-auto" />
              <CardTitle className="text-lg">{t('features.shorten.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('features.shorten.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart className="w-8 h-8 text-green-600 mx-auto" />
              <CardTitle className="text-lg">{t('features.analytics.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('features.analytics.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Settings className="w-8 h-8 text-purple-600 mx-auto" />
              <CardTitle className="text-lg">{t('features.manage.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('features.manage.description')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="admin">
              <Settings className="w-5 h-5 mr-2" />
              {t('accessAdmin')}
            </Link>
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('adminRequired')}
          </p>
        </div>
      </div>
    </div>
  )
}
