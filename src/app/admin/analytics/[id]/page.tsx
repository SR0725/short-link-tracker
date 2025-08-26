'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, ExternalLink, TrendingUp, Globe, Calendar, Eye, MousePointer, Timer, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n/context'
import { LanguageSwitcher } from '@/components/language-switcher'
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
  hourlyStats: { hour: number; count: number }[]
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
  const { t, language } = useI18n()
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
      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const response = await fetch(`/api/links/${resolvedParams.id}/analytics?days=${period}&timezone=${encodeURIComponent(userTimezone)}`)
      
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
        toast.success(language === 'zh-TW' ? 'CSV 檔案已下載' : 'CSV file downloaded')
      } else {
        toast.error(language === 'zh-TW' ? '下載失敗' : 'Download failed')
      }
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(language === 'zh-TW' ? '下載時發生錯誤' : 'Error occurred during download')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <TrendingUp className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-xl font-medium text-black">{t.analyticsLoadingData}</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-2xl shadow-xl border-2 border-gray-200"
        >
          <div className="text-black text-xl font-semibold">{error}</div>
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-2xl shadow-xl border-2 border-gray-200"
        >
          <div className="text-black text-xl font-semibold">{t.analyticsNoAnalyticsData}</div>
        </motion.div>
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
    <div className="min-h-screen bg-white">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher size={48} />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-12">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-6">
            {/* Top section with back button and title */}
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:space-x-4 lg:space-x-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin')}
                className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 self-start sm:self-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t.analyticsReturnDashboard}</span>
                <span className="sm:hidden">{t.analyticsReturn}</span>
              </Button>
              
              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-black tracking-tight">
                    {t.analyticsTitle}
                  </h1>
                  <div className="mt-1 sm:mt-2 space-y-1">
                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 font-medium break-all">
                      {baseUrl}/{data.link.slug}
                    </p>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 flex items-start">
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0 mt-0.5" />
                      <span className="break-all leading-tight">{data.link.targetUrl}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-sm"
              >
                <a
                  href={`${baseUrl}/${data.link.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t.analyticsVisitLink}</span>
                  <span className="sm:hidden">{t.analyticsVisit}</span>
                </a>
              </Button>
              <Button 
                onClick={handleExport} 
                size="sm"
                className="bg-black hover:bg-gray-800 text-white text-sm"
              >
                <Download className="w-4 h-4 mr-1 sm:mr-2" />
                {t.analyticsExportCsv}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Overview Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        >
          <Card className="bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">{t.analyticsTotalClicks}</CardTitle>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-black text-black">{formatNumber(data.link.totalClicks)}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold text-gray-700 leading-tight">{t.analyticsPeriodClicksWithPeriod} ({data.analytics.period})</CardTitle>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-lg sm:rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-black text-black">{formatNumber(data.analytics.totalClicksInPeriod)}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">{t.analyticsAverageDaily}: {averageClicksPerDay}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">{t.analyticsCoveredCountries}</CardTitle>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-black text-black">{totalUniqueCountries}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 leading-tight">{t.analyticsMainSource}: {topCountry}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">{t.analyticsCreatedAt}</CardTitle>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-black text-black leading-tight">
                {new Date(data.link.createdAt).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US')}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 leading-tight">{t.analyticsMainDevice}: {topDevice}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Period Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-black">{t.analyticsTimeRangeTitle}</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-1">{t.analyticsTimeRangeDesc}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              {[7, 30, 90].map((days) => (
                <Button
                  key={days}
                  variant={period === days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(days)}
                  className={`text-sm ${period === days ? 
                    'bg-black text-white hover:bg-gray-800' : 
                    'border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  {days} {t.analyticsDays}
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
          className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
        >
          <div className="p-4 sm:p-6 lg:p-8 border-b-2 border-gray-200">
            <h3 className="text-xl sm:text-2xl font-bold text-black flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              {t.analyticsGlobalDistTitle}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              <span className="hidden sm:inline">{t.analyticsGlobalDistDesc}</span>
              <span className="sm:hidden">{t.analyticsGlobalDistMobile}</span>
            </p>
          </div>
          <div className="p-2 sm:p-4 lg:p-6 relative">
            <div className="w-full h-48 xs:h-56 sm:h-80 md:h-96 lg:h-[400px] xl:h-[500px] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden relative touch-pan-x touch-pan-y">
              <ComposableMap
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
              
              {/* Enhanced Tooltip for mobile */}
              {tooltipContent && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 sm:p-3 z-10 pointer-events-none max-w-[200px] sm:max-w-none"
                  style={{
                    left: `${Math.min(Math.max(tooltipContent.x, 100), typeof window !== 'undefined' ? window.innerWidth - 200 : 300)}px`,
                    top: `${Math.max(tooltipContent.y - 10, 10)}px`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base whitespace-nowrap">
                    {tooltipContent.name}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {t.analyticsClicksTooltipLabel}: <span className="font-medium text-indigo-600 dark:text-indigo-400">{formatNumber(tooltipContent.count)}</span>
                  </div>
                  {tooltipContent.count > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1 whitespace-nowrap">
                      {t.analyticsPercentOfTotal}: {((tooltipContent.count / data.analytics.totalClicksInPeriod) * 100).toFixed(1)}%
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* Enhanced Color Legend */}
            <div className="mt-3 sm:mt-4 lg:mt-6 space-y-2 sm:space-y-3">
              <div className="text-center">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {t.analyticsClicksDistribution} {maxCountryClicks > 100 && <span className="text-xs hidden sm:inline">({t.analyticsLogScale})</span>}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 overflow-x-auto scrollbar-hide">
                <span className="text-xs text-slate-500 w-4 sm:w-6 lg:w-8 flex-shrink-0">0</span>
                <div className="flex space-x-0.5 sm:space-x-1 overflow-x-auto scrollbar-hide">
                  {maxCountryClicks > 100 ? 
                    // Logarithmic legend (fewer items for mobile)
                    (typeof window !== 'undefined' && window.innerWidth < 640 ?
                      [1, 25, maxCountryClicks].map((value, index) => (
                        <div key={index} className="flex flex-col items-center flex-shrink-0">
                          <div
                            className="w-3 h-3 sm:w-4 sm:h-3 lg:w-6 lg:h-4 border border-slate-400 dark:border-slate-500"
                            style={{
                              backgroundColor: getCountryColor(Math.min(value, maxCountryClicks), maxCountryClicks)
                            }}
                          />
                          <span className="text-xs text-slate-400 mt-0.5 sm:mt-1">
                            {formatNumber(Math.min(value, maxCountryClicks))}
                          </span>
                        </div>
                      ))
                      : 
                      [1, 5, 25, 125, 625, maxCountryClicks].map((value, index) => (
                        <div key={index} className="flex flex-col items-center flex-shrink-0">
                          <div
                            className="w-3 h-3 sm:w-4 sm:h-3 lg:w-6 lg:h-4 border border-slate-400 dark:border-slate-500"
                            style={{
                              backgroundColor: getCountryColor(Math.min(value, maxCountryClicks), maxCountryClicks)
                            }}
                          />
                          <span className="text-xs text-slate-400 mt-0.5 sm:mt-1">
                            {formatNumber(Math.min(value, maxCountryClicks))}
                          </span>
                        </div>
                      ))
                    )
                    :
                    // Linear legend
                    [0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => {
                      const value = Math.round(maxCountryClicks * ratio)
                      return (
                        <div key={index} className="flex flex-col items-center flex-shrink-0">
                          <div
                            className="w-3 h-3 sm:w-4 sm:h-3 lg:w-6 lg:h-4 border border-slate-400 dark:border-slate-500"
                            style={{
                              backgroundColor: getCountryColor(value, maxCountryClicks)
                            }}
                          />
                          {index > 0 && (
                            <span className="text-xs text-slate-400 mt-0.5 sm:mt-1">
                              {formatNumber(value)}
                            </span>
                          )}
                        </div>
                      )
                    })
                  }
                </div>
                <span className="text-xs text-slate-500 w-4 sm:w-6 lg:w-8 flex-shrink-0">{formatNumber(maxCountryClicks)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Click Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
        >
          <div className="p-4 sm:p-6 lg:p-8 border-b-2 border-gray-200">
            <h3 className="text-xl sm:text-2xl font-bold text-black flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              {t.analyticsClickTrendsTitle}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              {t.analyticsClickTrendsDesc} {period} {t.analyticsDailyAnalysis}
            </p>
          </div>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="h-48 xs:h-56 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.analytics.timeline} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return typeof window !== 'undefined' && window.innerWidth < 640 ?
                        `${date.getMonth() + 1}/${date.getDate()}` :
                        date.toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { month: 'short', day: 'numeric' })
                    }}
                    className="text-slate-600 dark:text-slate-400"
                    fontSize={12}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    className="text-slate-600 dark:text-slate-400" 
                    fontSize={12}
                    width={30}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US')}
                    formatter={(value) => [`${value} ${t.analyticsClicksTooltipText}`, t.analyticsClicksTooltipLabel]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
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

        {/* Enhanced Hourly Activity Analysis */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
        >
          <div className="p-4 sm:p-6 lg:p-8 border-b-2 border-gray-200">
            <h3 className="text-xl sm:text-2xl font-bold text-black flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              {t.analyticsHourlyTitle}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              {t.analyticsHourlyDesc}
            </p>
          </div>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="h-48 xs:h-56 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={data?.analytics.hourlyStats?.map(item => ({
                    hour: item.hour,
                    count: item.count,
                    hourLabel: `${item.hour.toString().padStart(2, '0')}:00`
                  })) || []} 
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(value) => `${value.toString().padStart(2, '0')}:00`}
                    className="text-slate-600 dark:text-slate-400"
                    fontSize={11}
                    interval={typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 1}
                  />
                  <YAxis 
                    className="text-slate-600 dark:text-slate-400" 
                    fontSize={12}
                    width={30}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `${value.toString().padStart(2, '0')}:00 - ${(parseInt(value) + 1).toString().padStart(2, '0')}:00`}
                    formatter={(value) => [`${value} ${t.analyticsClicksTooltipText}`, t.analyticsClicksTooltipLabel]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fill="url(#colorHourly)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Hour Analysis Insights */}
            {data?.analytics.hourlyStats && data.analytics.hourlyStats.length > 0 && (
              <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {(() => {
                  const stats = data.analytics.hourlyStats
                  const maxHour = stats.reduce((max, current) => current.count > max.count ? current : max, stats[0])
                  const minHour = stats.reduce((min, current) => current.count < min.count ? current : min, stats[0])
                  const totalHourlyClicks = stats.reduce((sum, item) => sum + item.count, 0)
                  const averagePerHour = Math.round(totalHourlyClicks / 24)
                  
                  // 判斷活躍時段
                  const getTimeSlot = (hour: number) => {
                    if (language === 'zh-TW') {
                      if (hour >= 6 && hour < 12) return '早上'
                      if (hour >= 12 && hour < 18) return '下午'
                      if (hour >= 18 && hour < 24) return '晚上'
                      return '深夜'
                    } else {
                      if (hour >= 6 && hour < 12) return 'Morning'
                      if (hour >= 12 && hour < 18) return 'Afternoon'
                      if (hour >= 18 && hour < 24) return 'Evening'
                      return 'Late Night'
                    }
                  }
                  
                  return (
                    <>
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="text-xs text-amber-600 font-medium mb-1">{t.analyticsMostActiveTime}</div>
                        <div className="text-lg font-bold text-amber-800">
                          {maxHour.hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="text-xs text-amber-600">
                          {getTimeSlot(maxHour.hour)} • {formatNumber(maxHour.count)} {t.analyticsClicksUnit}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-600 font-medium mb-1">{t.analyticsLeastActiveTime}</div>
                        <div className="text-lg font-bold text-blue-800">
                          {minHour.hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="text-xs text-blue-600">
                          {getTimeSlot(minHour.hour)} • {formatNumber(minHour.count)} {t.analyticsClicksUnit}
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs text-green-600 font-medium mb-1">{t.analyticsAverageHourly}</div>
                        <div className="text-lg font-bold text-green-800">
                          {formatNumber(averagePerHour)}
                        </div>
                        <div className="text-xs text-green-600">
                          {t.analyticsClicksTooltipLabel}
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-xs text-purple-600 font-medium mb-1">{t.analyticsActivityRate}</div>
                        <div className="text-lg font-bold text-purple-800">
                          {((maxHour.count / (minHour.count || 1)) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-purple-600">
                          {t.analyticsPeakGap}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
            
            {/* Time zone note */}
            <div className="mt-4 sm:mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-blue-700">
                  <span className="font-medium">{t.analyticsTimezoneTitle}</span>
                  {t.analyticsTimezoneDesc} {Intl.DateTimeFormat().resolvedOptions().timeZone} ({new Date().toLocaleTimeString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { timeZoneName: 'short' }).split(' ')[1]})，{t.analyticsTimezoneDesc2}
                </div>
              </div>
            </div>
          </CardContent>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
            {/* Enhanced Top Referrers */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500" />
                  {t.analyticsReferrersTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t.analyticsReferrersDesc} {period} {t.analyticsReferrersDesc2}
                </p>
              </div>
              <div className="p-4 sm:p-6">
                {data.analytics.topReferrers.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400 text-center py-6 sm:py-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <ExternalLink className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-sm">{t.analyticsNoReferrerData}</span>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto scrollbar-hide">
                    {data.analytics.topReferrers.map((referrer, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div 
                            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium text-slate-700 dark:text-slate-300 text-sm sm:text-base truncate">
                            {referrer.domain || t.analyticsDirectAccess}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
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
                  {t.analyticsDeviceTitle}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t.analyticsDeviceDesc}
                </p>
              </div>
              <div className="p-6">
                {data.analytics.deviceStats.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <MousePointer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    {t.analyticsNoDeviceData}
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
                            formatter={(value, name) => [`${value} ${t.analyticsClicksTooltipText}`, name]}
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
          transition={{ delay: 0.65 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
        >
            {/* Enhanced Country Distribution */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-500" />
                  {t.analyticsCountryTitle}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t.analyticsCountryDesc}
                </p>
              </div>
              <div className="p-4 sm:p-6 max-h-60 sm:max-h-80 overflow-y-auto">
                {data.analytics.countryStats.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    {t.analyticsNoCountryData}
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
                  {t.analyticsCityTitle}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t.analyticsCityDesc}
                </p>
              </div>
              <div className="p-4 sm:p-6 max-h-60 sm:max-h-80 overflow-y-auto">
                {data.analytics.cityStats.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    {t.analyticsNoCityData}
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
          transition={{ delay: 0.7 }}
          className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm"
        >
          <div className="flex items-center justify-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>{t.analyticsDataRealtime} • {t.analyticsLastUpdated}: {new Date().toLocaleString(language === 'zh-TW' ? 'zh-TW' : 'en-US')}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}