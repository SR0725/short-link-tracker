export const LANGUAGES = {
  'zh-TW': '繁體中文',
  'en': 'English'
} as const;

export type Language = keyof typeof LANGUAGES;

export const DEFAULT_LANGUAGE: Language = 'zh-TW';

export const LANGUAGE_QUERY_PARAM = 'lang';