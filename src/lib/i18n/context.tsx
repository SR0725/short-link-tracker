"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Language } from './config';
import { DEFAULT_LANGUAGE, LANGUAGE_QUERY_PARAM } from './config';
import { translations, type Translations } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化語言設置
  useEffect(() => {
    const urlLang = searchParams.get(LANGUAGE_QUERY_PARAM) as Language;
    const savedLang = localStorage.getItem('preferred-language') as Language;
    
    let initialLang: Language = DEFAULT_LANGUAGE;
    
    // 優先級：URL query string > localStorage > 預設語言
    if (urlLang && translations[urlLang]) {
      initialLang = urlLang;
    } else if (savedLang && translations[savedLang]) {
      initialLang = savedLang;
    }
    
    setLanguageState(initialLang);
    setIsLoading(false);
    
    // 如果 localStorage 中的語言和當前語言不同，更新 localStorage
    if (savedLang !== initialLang) {
      localStorage.setItem('preferred-language', initialLang);
    }
  }, [searchParams]);

  const setLanguage = (newLang: Language) => {
    if (!translations[newLang]) return;
    
    setLanguageState(newLang);
    localStorage.setItem('preferred-language', newLang);
    
    // 更新 URL query string
    const params = new URLSearchParams(searchParams);
    params.set(LANGUAGE_QUERY_PARAM, newLang);
    
    // 使用 replace 而不是 push，避免在歷史記錄中留下語言切換記錄
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const t = translations[language];

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}