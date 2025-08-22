import { nanoid } from 'nanoid'
import { UAParser } from 'ua-parser-js'
import { db } from './db'
import path from 'path'
import fs from 'fs'

// 條件式載入 geoip-lite
let geoip: typeof import('geoip-lite') | null = null
try {
  // 嘗試多個可能的 geoip 資料路徑
  const possibleDataPaths = [
    path.join(process.cwd(), 'node_modules', 'geoip-lite', 'data'),
    path.join(process.cwd(), 'node_modules', '.pnpm', 'geoip-lite@1.4.10', 'node_modules', 'geoip-lite', 'data'),
  ]
  
  let geoipDataPath: string | null = null
  for (const dataPath of possibleDataPaths) {
    const countryDataFile = path.join(dataPath, 'geoip-country.dat')
    if (fs.existsSync(countryDataFile)) {
      geoipDataPath = dataPath
      break
    }
  }
  
  if (!geoipDataPath) {
    console.warn('⚠️  GeoIP data files not found in any expected location')
    throw new Error('GeoIP data files not found')
  }
  
  // 設定環境變數指向正確的資料目錄（在載入模組之前）
  process.env.GEODATADIR = geoipDataPath
  
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  geoip = require('geoip-lite')
  
  // 驗證 geoip 是否真的可用
  if (geoip) {
    const testResult = geoip.lookup('8.8.8.8')
    if (!testResult) {
      console.warn('⚠️  GeoIP test lookup failed - data files may be missing')
      geoip = null
    } else {
      console.log('✅ GeoIP loaded successfully with data from:', geoipDataPath)
    }
  }
} catch (error) {
  console.warn('⚠️  GeoIP module not available:', error instanceof Error ? error.message : 'Unknown error')
  geoip = null
}

export function generateSlug(length: number = 6): string {
  return nanoid(length)
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await db.link.findUnique({
    where: { slug }
  })
  return !existing
}

export async function createShortUrl(
  targetUrl: string, 
  customSlug?: string,
  options?: {
    title?: string;
    tag?: string;
    expiresAt?: Date;
    clickLimit?: number;
  }
): Promise<{ slug: string; id: string }> {
  let slug = customSlug

  if (slug) {
    const isAvailable = await isSlugAvailable(slug)
    if (!isAvailable) {
      throw new Error('Slug already exists')
    }
  } else {
    do {
      slug = generateSlug()
    } while (!(await isSlugAvailable(slug)))
  }

  const link = await db.link.create({
    data: {
      slug: slug!,
      targetUrl,
      title: options?.title,
      tag: options?.tag,
      expiresAt: options?.expiresAt,
      clickLimit: options?.clickLimit
    }
  })

  return { slug: slug!, id: link.id }
}

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()
  
  // 正確的裝置類型判斷
  let deviceType: string = result.device.type || 'unknown'
  
  if (deviceType === 'unknown') {
    // 檢查 UA 字串中的裝置指標
    const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPod', 'BlackBerry', 'Opera Mini', 'Windows Phone']
    const tabletKeywords = ['iPad', 'Tablet', 'Kindle']
    const desktopKeywords = ['Macintosh', 'Windows NT', 'Linux', 'CrOS']
    
    const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword))
    const isTablet = tabletKeywords.some(keyword => userAgent.includes(keyword))
    const isDesktop = desktopKeywords.some(keyword => userAgent.includes(keyword))
    
    if (isTablet) {
      deviceType = 'tablet'
    } else if (isMobile && !isDesktop) {
      // 只有在確定是 mobile 且不是 desktop 時才判斷為 mobile
      deviceType = 'mobile'
    } else if (isDesktop) {
      deviceType = 'desktop'
    } else {
      // 預設為 desktop（更保守的判斷）
      deviceType = 'desktop'
    }
  }
  
  return {
    device: deviceType,
    browser: result.browser.name,
    os: result.os.name
  }
}

// 檢查 GeoIP 是否可用的快取變數
let geoipAvailable: boolean | null = null
let geoipWarningShown = false

export function getLocationFromIP(ip: string): { country: string | null; city: string | null } {
  try {
    // 過濾本地 IP
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return { country: null, city: null }
    }
    
    // 第一次檢查 GeoIP 是否可用
    if (geoipAvailable === null) {
      if (!geoip) {
        geoipAvailable = false
      } else {
        try {
          // 使用已知的公共 IP 測試 GeoIP 功能
          const testResult = geoip.lookup('8.8.8.8')
          geoipAvailable = testResult !== null
        } catch (testError) {
          geoipAvailable = false
          if (!geoipWarningShown) {
            console.warn('⚠️  GeoIP lookup test failed:', testError instanceof Error ? testError.message : 'Unknown error')
            geoipWarningShown = true
          }
        }
      }
      
      if (!geoipAvailable && !geoipWarningShown) {
        console.warn('⚠️  GeoIP database not available - country detection disabled')
        console.warn('💡 To enable country detection:')
        console.warn('   1. Get free license key: https://www.maxmind.com/en/geolite2/signup')
        console.warn('   2. Set MAXMIND_LICENSE_KEY in .env')
        console.warn('   3. Run: pnpm update-geoip')
        geoipWarningShown = true
      }
    }
    
    if (!geoipAvailable || !geoip) {
      return { country: null, city: null }
    }
    
    const geo = geoip.lookup(ip)
    return {
      country: geo?.country || null,
      city: geo?.city || null
    }
  } catch (error) {
    // 靜默處理錯誤，避免影響應用程式運行
    if (!geoipWarningShown) {
      console.warn('⚠️  GeoIP lookup error:', error instanceof Error ? error.message : 'Unknown error')
      geoipWarningShown = true
    }
    return { country: null, city: null }
  }
}

export async function recordClick(linkId: string, request: Request) {
  const userAgent = request.headers.get('user-agent') || ''
  const referrer = request.headers.get('referer') || null
  
  const { device, browser, os } = parseUserAgent(userAgent)

  
  // Get IP from various headers (considering proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || '127.0.0.1'
  
  const { country, city } = getLocationFromIP(ip)

  // Record click and update lastClickAt
  await Promise.all([
    db.click.create({
      data: {
        linkId,
        referrer,
        userAgent,
        device,
        country,
        city,
      }
    }),
    db.link.update({
      where: { id: linkId },
      data: { lastClickAt: new Date() }
    })
  ])
}