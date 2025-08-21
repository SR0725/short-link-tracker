import { NextRequest, NextResponse } from 'next/server'
import { getAuthStatus } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await getAuthStatus()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params
    
    // Get basic link info
    const link = await db.link.findUnique({
      where: { id },
      include: {
        _count: { select: { clicks: true } }
      }
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get clicks for the time period
    const clicks = await db.click.findMany({
      where: {
        linkId: id,
        timestamp: {
          gte: startDate
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    // Group clicks by date
    const clicksByDate: { [key: string]: number } = {}
    clicks.forEach(click => {
      const date = click.timestamp.toISOString().split('T')[0]
      clicksByDate[date] = (clicksByDate[date] || 0) + 1
    })

    // Fill in missing dates with 0
    const dateRange = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dateRange.push({
        date: dateStr,
        clicks: clicksByDate[dateStr] || 0
      })
    }

    // Get top referrers
    const referrerCounts: { [key: string]: number } = {}
    clicks.forEach(click => {
      if (click.referrer) {
        try {
          const domain = new URL(click.referrer).hostname
          referrerCounts[domain] = (referrerCounts[domain] || 0) + 1
        } catch {
          referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1
        }
      } else {
        referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1
      }
    })

    const topReferrers = Object.entries(referrerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }))

    // Get device distribution
    const deviceCounts: { [key: string]: number } = {}
    clicks.forEach(click => {
      const device = click.device || 'unknown'
      deviceCounts[device] = (deviceCounts[device] || 0) + 1
    })

    const deviceStats = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))

    // Get country distribution
    const countryCounts: { [key: string]: number } = {}
    clicks.forEach(click => {
      const country = click.country || 'Unknown'
      countryCounts[country] = (countryCounts[country] || 0) + 1
    })

    const countryStats = Object.entries(countryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))

    return NextResponse.json({
      link: {
        id: link.id,
        slug: link.slug,
        targetUrl: link.targetUrl,
        createdAt: link.createdAt,
        totalClicks: link._count.clicks
      },
      analytics: {
        period: `${days} days`,
        timeline: dateRange,
        topReferrers,
        deviceStats,
        countryStats,
        totalClicksInPeriod: clicks.length
      }
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}