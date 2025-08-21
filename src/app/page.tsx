import { redirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/config'

// This page only renders when the app is built statically (output: 'export')
export default function RootPage() {
  redirect(`/${defaultLocale}`)
}