export const locales = ['en', 'zh-tw'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  'en': 'English',
  'zh-tw': '繁體中文'
}