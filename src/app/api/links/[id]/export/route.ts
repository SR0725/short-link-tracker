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
    
    const link = await db.link.findUnique({
      where: { id },
      include: {
        clicks: {
          orderBy: { timestamp: 'desc' }
        }
      }
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // Generate CSV data
    const csvHeaders = ['Timestamp', 'Referrer', 'Device', 'Country', 'User Agent']
    const csvRows = link.clicks.map(click => [
      click.timestamp.toISOString(),
      click.referrer || 'Direct',
      click.device || 'Unknown',
      click.country || 'Unknown',
      click.userAgent.replace(/"/g, '""') // Escape quotes
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      )
    ].join('\n')

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${link.slug}-analytics.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}