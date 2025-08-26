"use client";

import { useI18n } from '@/lib/i18n/context';
import { LANGUAGES, type Language } from '@/lib/i18n/config';
import { motion } from 'framer-motion';

interface LanguageSwitcherProps {
  size?: number;
}

export function LanguageSwitcher({ 
  size = 44
}: LanguageSwitcherProps) {
  const { language, setLanguage, t, isLoading } = useI18n();

  if (isLoading) {
    return (
      <div 
        className="bg-gray-200 animate-pulse rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }

  const toggleLanguage = () => {
    const currentIndex = Object.keys(LANGUAGES).indexOf(language);
    const nextIndex = (currentIndex + 1) % Object.keys(LANGUAGES).length;
    const nextLanguage = Object.keys(LANGUAGES)[nextIndex] as Language;
    setLanguage(nextLanguage);
  };

  const getCurrentLanguageDisplay = () => {
    return language === 'zh-TW' ? 'EN' : '中';
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className="bg-black/80 backdrop-blur-sm hover:bg-black text-white rounded-lg flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={t.languageSwitcher}
    >
      <span className="text-sm">
        {getCurrentLanguageDisplay()}
      </span>
    </motion.button>
  );
}