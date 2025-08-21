import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

export default createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}