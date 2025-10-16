'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { LanguageSwitcher } from '@/components/language-switcher'

interface Settings {
  custom404Title: string
  custom404Description: string
  custom404ButtonText: string
  custom404ButtonUrl: string
  logoUrl?: string
}

export default function NotFoundPage() {
  const { language } = useI18n()
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-black border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher size={48} />
      </div>
      
      <motion.section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center px-8 relative z-10"
        >
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            {settings.logoUrl ? (
              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                src={settings.logoUrl} 
                alt="Logo" 
                className="w-20 h-20 object-contain mx-auto mb-6"
              />
            ) : (
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Home className="w-10 h-10 text-white" />
              </motion.div>
            )}
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-6xl md:text-8xl font-black text-black mb-4 tracking-tight"
            >
              {settings.custom404Title}
            </motion.h1>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-600 mb-6"
            >
              {language === 'zh-TW' ? '找不到短連結' : 'Short Link Not Found'}
            </motion.h2>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {settings.custom404Description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-12 py-6 bg-black hover:bg-gray-800 text-white rounded-full shadow-2xl hover:shadow-black/25 transition-all duration-300"
            >
              <Link href={settings.custom404ButtonUrl}>
                <Home className="w-6 h-6 mr-3" />
                {settings.custom404ButtonText}
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}