'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Download, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Link {
  id: string
  slug: string
  targetUrl: string
  createdAt: string
  totalClicks: number
}

interface Analytics {
  period: string
  timeline: { date: string; clicks: number }[]
  topReferrers: { domain: string; count: number }[]
  deviceStats: { device: string; count: number }[]
  countryStats: { country: string; count: number }[]
  totalClicksInPeriod: number
}

interface AnalyticsData {
  link: Link
  analytics: Analytics
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState(7)
  const [error, setError] = useState('')
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (resolvedParams) {
      loadAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams, period])

  const loadAnalytics = async () => {
    if (!resolvedParams) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/links/${resolvedParams.id}/analytics?days=${period}`)
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load analytics')
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    if (!resolvedParams) return
    
    try {
      const response = await fetch(`/api/links/${resolvedParams.id}/export`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${data?.link.slug}-analytics.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('CSV 檔案已下載')
      } else {
        toast.error('下載失敗')
      }
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('下載時發生錯誤')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>No data found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {baseUrl}/{data.link.slug} → {data.link.targetUrl}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={`${baseUrl}/${data.link.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Link
              </a>
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.link.totalClicks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Clicks ({data.analytics.period})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.analytics.totalClicksInPeriod}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(data.link.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Time Period</CardTitle>
            <div className="flex space-x-2">
              {[7, 30].map((days) => (
                <Button
                  key={days}
                  variant={period === days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(days)}
                >
                  {days} days
                </Button>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Click Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Click Timeline</CardTitle>
            <CardDescription>
              Daily clicks over the past {period} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.analytics.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value) => [value, 'Clicks']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>
                Traffic sources for the past {period} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.analytics.topReferrers.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No referrer data available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.analytics.topReferrers.map((referrer, index) => (
                      <TableRow key={index}>
                        <TableCell>{referrer.domain}</TableCell>
                        <TableCell className="text-right">{referrer.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Device Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Device Distribution</CardTitle>
              <CardDescription>
                Devices used to access your links
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.analytics.deviceStats.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No device data available
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.analytics.deviceStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device, count }) => `${device}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="device"
                      >
                        {data.analytics.deviceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Country Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Country Distribution</CardTitle>
            <CardDescription>
              Geographic distribution of clicks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.analytics.countryStats.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                No country data available
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.analytics.countryStats.map((country, index) => (
                    <TableRow key={index}>
                      <TableCell>{country.country}</TableCell>
                      <TableCell className="text-right">{country.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}