'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, ExternalLink, TrendingUp, Globe, Calendar, Eye, MousePointer, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { scaleSequential } from 'd3-scale'
import { interpolateBlues } from 'd3-scale-chromatic'
import { motion } from 'framer-motion'
import { isoToCountryName } from '@/data/isoToCountryName'

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
  cityStats: { city: string; count: number }[]
  totalClicksInPeriod: number
}

interface AnalyticsData {
  link: Link
  analytics: Analytics
}

const COLORS = ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#111827', '#1e293b']

// World map topography data URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Helper functions
const getCountryClickCount = (countryName: string, countryStats: { country: string; count: number }[]) => {
  // countryStats contains ISO codes, so we need to find by ISO code
  // Exclude "Unknown" countries from map display
  const country = countryStats.find(c => {
    if (c.country === 'Unknown' || c.country === 'unknown' || c.country === 'N/A') {
      return false
    }
    const fullName = isoToCountryName[c.country] || c.country
    return fullName === countryName || c.country === countryName
  })
  return country ? country.count : 0
}


const getCountryColor = (clickCount: number, maxClicks: number) => {
  if (clickCount === 0) return '#f8fafc' // Light gray for no clicks
  if (maxClicks === 0) return '#f8fafc'
  
  // Use logarithmic scale for better visual distribution when there's a large range
  const useLogScale = maxClicks > 100
  
  if (useLogScale) {
    // Logarithmic scale for better distribution
    const logMax = Math.log(maxClicks + 1)
    const logCurrent = Math.log(clickCount + 1)
    const normalizedValue = logCurrent / logMax
    
    const scale = scaleSequential()
      .domain([0, 1])
      .interpolator(interpolateBlues)
    
    return scale(normalizedValue)
  } else {
    // Linear scale for smaller ranges
    const scale = scaleSequential()
      .domain([1, maxClicks])
      .interpolator(interpolateBlues)
    
    return scale(clickCount)
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState(7)
  const [error, setError] = useState('')
  const [tooltipContent, setTooltipContent] = useState<{ name: string; count: number; x: number; y: number } | null>(null)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-800 dark:border-gray-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-800 dark:text-gray-400">載入分析資料中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
          <div className="text-gray-800 dark:text-gray-300 text-lg font-medium">{error}</div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="text-gray-800 dark:text-gray-400">找不到分析數據</div>
        </div>
      </div>
    )
  }

  // Filter out "Unknown" countries for map calculations
  const validCountryStats = data.analytics.countryStats.filter(c => 
    c.country !== 'Unknown' && c.country !== 'unknown' && c.country !== 'N/A'
  )
  const maxCountryClicks = Math.max(...validCountryStats.map(c => c.count), 1)
  
  const totalUniqueCountries = validCountryStats.length
  const averageClicksPerDay = Math.round(data.analytics.totalClicksInPeriod / period)
  const topCountry = validCountryStats[0] ? 
    (isoToCountryName[validCountryStats[0].country] || validCountryStats[0].country) : 'N/A'
  const topDevice = data.analytics.deviceStats[0]?.device || 'N/A'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full lg:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin')}
                className="border-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回儀表板
              </Button>
              <div className="w-full">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  分析詳情
                </h1>
                <div className="mt-3 space-y-1">
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base break-all">
                    {baseUrl}/{data.link.slug}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm flex items-start sm:items-center">
                    <ExternalLink className="w-3 h-3 mr-1 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <span className="break-all">{data.link.targetUrl}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 w-full sm:w-auto"
              >
                <a
                  href={`${baseUrl}/${data.link.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">訪問連結</span>
                  <span className="sm:hidden">訪問</span>
                </a>
              </Button>
              <Button 
                onClick={handleExport} 
                variant="outline" 
                size="sm"
                className="bg-gray-900 dark:bg-gray-700 border-gray-900 dark:border-gray-600 hover:bg-gray-800 dark:hover:bg-gray-600 text-white w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">匯出 CSV</span>
                <span className="sm:hidden">匯出</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Overview Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">總點擊數</CardTitle>
                <Eye className="w-5 h-5 text-gray-800 dark:text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(data.link.totalClicks)}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">期間點擊 ({data.analytics.period})</CardTitle>
                <TrendingUp className="w-5 h-5 text-gray-800 dark:text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(data.analytics.totalClicksInPeriod)}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">平均每日: {averageClicksPerDay}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">覆蓋國家</CardTitle>
                <Globe className="w-5 h-5 text-gray-800 dark:text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{totalUniqueCountries}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">主要來源: {topCountry}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">建立時間</CardTitle>
                <Calendar className="w-5 h-5 text-gray-800 dark:text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {new Date(data.link.createdAt).toLocaleDateString('zh-TW')}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">主要裝置: {topDevice}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Period Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">時間範圍</h3>
              <p className="text-sm text-gray-700 dark:text-gray-400">選擇要查看的分析時段</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {[7, 30, 90].map((days) => (
                <Button
                  key={days}
                  variant={period === days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(days)}
                  className={`flex-1 sm:flex-none ${period === days ? 
                    'bg-gray-900 text-white border-0 shadow-md hover:bg-gray-800' : 
                    'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {days} 天
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced World Map Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-xl overflow-hidden relative"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-gray-800 dark:text-gray-400" />
              全球點擊分佈
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
              顏色越深表示該地區的點擊量越高，滑鼠移到國家上查看詳細資訊
            </p>
          </div>
          <div className="p-2 sm:p-4 lg:p-6 relative">
            <div className="w-full h-64 sm:h-96 md:h-[400px] lg:h-[500px] xl:h-[600px] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden relative">
              <ComposableMap
                projectionConfig={{
                  scale: typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : typeof window !== 'undefined' && window.innerWidth < 1024 ? 140 : 160,
                }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryName = geo.properties?.NAME || geo.properties?.name
                      const clickCount = getCountryClickCount(countryName, data.analytics.countryStats)
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={getCountryColor(clickCount, maxCountryClicks)}
                          stroke="#64748b"
                          strokeWidth={0.8}
                          style={{
                            default: {
                              outline: 'none',
                            },
                            hover: {
                              outline: 'none',
                              fill: clickCount > 0 ? '#4f46e5' : '#e2e8f0',
                              cursor: 'pointer',
                              stroke: '#1e293b',
                              strokeWidth: 1.5,
                            },
                            pressed: {
                              outline: 'none',
                            },
                          }}
                          onMouseEnter={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect()
                            setTooltipContent({ 
                              name: countryName, 
                              count: clickCount,
                              x: event.clientX - rect.left + 10,
                              y: event.clientY - rect.top - 10
                            })
                          }}
                          onMouseMove={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect()
                            if (tooltipContent) {
                              setTooltipContent({ 
                                ...tooltipContent,
                                x: event.clientX - rect.left + 10,
                                y: event.clientY - rect.top - 10
                              })
                            }
                          }}
                          onMouseLeave={() => {
                            setTooltipContent(null)
                          }}
                        />
                      )
                    })
                  }
                </Geographies>
              </ComposableMap>
              
              {/* Tooltip */}
              {tooltipContent && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 z-10 pointer-events-none"
                  style={{
                    left: `${tooltipContent.x}px`,
                    top: `${tooltipContent.y}px`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {tooltipContent.name}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    點擊數: <span className="font-medium text-indigo-600 dark:text-indigo-400">{formatNumber(tooltipContent.count)}</span>
                  </div>
                  {tooltipContent.count > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1 whitespace-nowrap">
                      佔總數: {((tooltipContent.count / data.analytics.totalClicksInPeriod) * 100).toFixed(1)}%
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* Enhanced Color Legend */}
            <div className="mt-4 sm:mt-6 space-y-3">
              <div className="text-center">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  點擊數量分佈 {maxCountryClicks > 100 && <span className="text-xs">(對數比例)</span>}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto">
                <span className="text-xs text-slate-500 w-6 sm:w-8 flex-shrink-0">0</span>
                <div className="flex space-x-1 overflow-x-auto">
                  {maxCountryClicks > 100 ? 
                    // Logarithmic legend
                    [1, 5, 25, 125, 625, maxCountryClicks].map((value, index) => (
                      <div key={index} className="flex flex-col items-center flex-shrink-0">
                        <div
                          className="w-4 h-3 sm:w-6 sm:h-4 border border-slate-400 dark:border-slate-500"
                          style={{
                            backgroundColor: getCountryColor(Math.min(value, maxCountryClicks), maxCountryClicks)
                          }}
                        />
                        <span className="text-xs text-slate-400 mt-1">
                          {formatNumber(Math.min(value, maxCountryClicks))}
                        </span>
                      </div>
                    ))
                    :
                    // Linear legend
                    [0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => {
                      const value = Math.round(maxCountryClicks * ratio)
                      return (
                        <div key={index} className="flex flex-col items-center flex-shrink-0">
                          <div
                            className="w-4 h-3 sm:w-6 sm:h-4 border border-slate-400 dark:border-slate-500"
                            style={{
                              backgroundColor: getCountryColor(value, maxCountryClicks)
                            }}
                          />
                          {index > 0 && (
                            <span className="text-xs text-slate-400 mt-1">
                              {formatNumber(value)}
                            </span>
                          )}
                        </div>
                      )
                    })
                  }
                </div>
                <span className="text-xs text-slate-500 w-6 sm:w-8 flex-shrink-0">{formatNumber(maxCountryClicks)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Click Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
              點擊趨勢
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              過去 {period} 天的每日點擊分析
            </p>
          </div>
          <CardContent className="p-6">
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.analytics.timeline}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                    className="text-slate-600 dark:text-slate-400"
                  />
                  <YAxis className="text-slate-600 dark:text-slate-400" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('zh-TW')}
                    formatter={(value) => [`${value} 次點擊`, '點擊數']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fill="url(#colorClicks)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
        >
            {/* Enhanced Top Referrers */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2 text-emerald-500" />
                  主要推薦來源
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  過去 {period} 天的流量來源
                </p>
              </div>
              <div className="p-6">
                {data.analytics.topReferrers.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    暫無推薦來源資料
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.analytics.topReferrers.map((referrer, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {referrer.domain || '直接訪問'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatNumber(referrer.count)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {((referrer.count / data.analytics.totalClicksInPeriod) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Device Stats */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <MousePointer className="w-5 h-5 mr-2 text-purple-500" />
                  裝置分佈
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  用戶使用的裝置類型
                </p>
              </div>
              <div className="p-6">
                {data.analytics.deviceStats.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <MousePointer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    暫無裝置資料
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.analytics.deviceStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="count"
                            nameKey="device"
                          >
                            {data.analytics.deviceStats.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} 次點擊`, name]}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.analytics.deviceStats.map((device, index) => (
                        <div 
                          key={index}
                          className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg"
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {device.device}
                          </span>
                          <span className="text-sm text-slate-500 ml-auto">
                            {formatNumber(device.count)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
        >
            {/* Enhanced Country Distribution */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-500" />
                  國家分佈
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  點擊量的地理分佈
                </p>
              </div>
              <div className="p-4 sm:p-6 max-h-60 sm:max-h-80 overflow-y-auto">
                {data.analytics.countryStats.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    暫無國家資料
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.analytics.countryStats
                      .map((country, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {isoToCountryName[country.country] || country.country}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatNumber(country.count)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {((country.count / data.analytics.totalClicksInPeriod) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced City Distribution */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <Timer className="w-5 h-5 mr-2 text-orange-500" />
                  城市分佈
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  點擊來源的主要城市
                </p>
              </div>
              <div className="p-4 sm:p-6 max-h-60 sm:max-h-80 overflow-y-auto">
                {data.analytics.cityStats.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    暫無城市資料
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.analytics.cityStats.map((city, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full text-orange-600 dark:text-orange-400 text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {city.city}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatNumber(city.count)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {((city.count / data.analytics.totalClicksInPeriod) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
        </motion.div>

        {/* Footer with additional insights */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm"
        >
          <div className="flex items-center justify-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>資料即時更新 • 最後更新: {new Date().toLocaleString('zh-TW')}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}