"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Link as LinkIcon, Coffee, AtSign, Globe, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"

export default function Footer() {
  const { t, language } = useI18n()
  const [isHovered, setIsHovered] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    const hiddenUntil = localStorage.getItem('footerHiddenUntil')
    if (hiddenUntil) {
      const hiddenDate = new Date(hiddenUntil)
      if (new Date() < hiddenDate) {
        setIsHidden(true)
      } else {
        localStorage.removeItem('footerHiddenUntil')
      }
    }
  }, [])

  const handleHideFooter = () => {
    const oneMonthFromNow = new Date()
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
    localStorage.setItem('footerHiddenUntil', oneMonthFromNow.toISOString())
    setIsHidden(true)
    setShowModal(false)
  }

  const links = [
    {
      name: "Threads",
      url: "https://www.threads.com/@ray.realms",
      icon: AtSign,
      description: t.footerThreadsDescription
    },
    {
      name: language === 'zh-TW' ? "個人網站" : "Website",
      url: "https://ray-realms.com/",
      icon: Globe,
      description: language === 'zh-TW' ? "探索更多專案" : "Explore more projects"
    },
    {
      name: "BuyMeACoffee",
      url: "https://buymeacoffee.com/ray948787o",
      icon: Coffee,
      description: t.footerSponsorDescription
    }
  ]

  if (isHidden) {
    return null
  }

  return (
    <>
      <motion.footer
        className="relative bg-white border-t border-gray-100 py-8"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hide Footer Button */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setShowModal(true)}
              className="absolute top-4 right-4 z-10 bg-black text-white px-3 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2 shadow-lg"
            >
              <EyeOff className="w-4 h-4" />
              <span>{t.footerHideButton}</span>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Author Info */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">{t.footerAuthor}</h3>
                <p className="text-sm text-gray-600">
                 {t.footerDescription}
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center space-x-4">
              {links.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 hover:bg-black rounded-xl flex items-center justify-center group transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <link.icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.footer>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md w-full relative"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
                  <LinkIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">{t.footerModalTitle}</h3>
                <p className="text-gray-600">
                  {t.footerModalDescription}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <a
                  href="https://www.threads.com/@ray.realms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    <AtSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">{language === 'zh-TW' ? '追蹤 Threads' : 'Follow on Threads'}</h4>
                    <p className="text-sm text-gray-600">{t.footerThreadsDescription}</p>
                  </div>
                </a>

                <a
                  href="https://buymeacoffee.com/ray948787o"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    <Coffee className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">{language === 'zh-TW' ? '贊助咖啡' : 'Buy Me Coffee'}</h4>
                    <p className="text-sm text-gray-600">{t.footerSponsorDescription}</p>
                  </div>
                </a>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  {t.footerCancel}
                </Button>
                <Button
                  onClick={handleHideFooter}
                  className="flex-1 bg-black hover:bg-gray-800 text-white rounded-full"
                >
                  {t.footerHideMonth}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}