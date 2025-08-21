import { nanoid } from 'nanoid'
import { UAParser } from 'ua-parser-js'
import { db } from './db'

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
  
  const deviceType = result.device.type || 
    (result.device.vendor || result.device.model ? 'mobile' : 'desktop')
  
  return {
    device: deviceType,
    browser: result.browser.name,
    os: result.os.name
  }
}

export function getCountryFromIP(_ip: string): string | null {
  // Simple IP to country mapping - in production, use a real service
  // For now, return null and handle in the UI
  return null
}

export async function recordClick(linkId: string, request: Request) {
  const userAgent = request.headers.get('user-agent') || ''
  const referrer = request.headers.get('referer') || null
  
  const { device } = parseUserAgent(userAgent)
  
  // Get IP from various headers (considering proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || '127.0.0.1'
  
  const country = getCountryFromIP(ip)

  // Record click and update lastClickAt
  await Promise.all([
    db.click.create({
      data: {
        linkId,
        referrer,
        userAgent,
        device,
        country
      }
    }),
    db.link.update({
      where: { id: linkId },
      data: { lastClickAt: new Date() }
    })
  ])
}