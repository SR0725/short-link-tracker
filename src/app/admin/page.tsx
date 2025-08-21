'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QRCodeGenerator } from '@/components/qr-code-generator'
import { Plus, ExternalLink, BarChart, Copy, LogOut, Settings, ChevronUp, ChevronDown, QrCode } from 'lucide-react'

interface Link {
  id: string
  slug: string
  targetUrl: string
  title?: string
  tag?: string
  expiresAt?: string
  clickLimit?: number
  lastClickAt?: string
  createdAt: string
  clickCount: number
}

export default function AdminPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [clickLimit, setClickLimit] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [error, setError] = useState('')
  const [showQrCode, setShowQrCode] = useState<string | null>(null)
  const router = useRouter()

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadLinks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, isAuthenticated])

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...')
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      
      console.log('Auth check response:', data)
      
      await new Promise(resolve => setTimeout(resolve, 10000))
      if (data.authenticated) {
        console.log('User is authenticated, loading links...')
        setIsAuthenticated(true)
        loadLinks()
      } else {
        console.log('User not authenticated, redirecting to login...')
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const loadLinks = async () => {
    try {
      const url = `/api/links?sort=${sortBy}&order=${sortOrder}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setLinks(data)
      }
    } catch (error) {
      console.error('Failed to load links:', error)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError('')

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl,
          customSlug: customSlug || undefined,
          title: title || undefined,
          tag: tag || undefined,
          expiresAt: expiresAt || undefined,
          clickLimit: clickLimit ? parseInt(clickLimit) : undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTargetUrl('')
        setCustomSlug('')
        setTitle('')
        setTag('')
        setExpiresAt('')
        setClickLimit('')
        loadLinks() // Refresh the list
      } else {
        setError(data.error || '建立短網址失敗')
      }
    } catch {
      setError('網路錯誤，請重試')
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">短網址管理系統</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              建立和管理您的短網址
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/admin/settings')} variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              設定
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              登出
            </Button>
          </div>
        </div>

        {/* Create New Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              建立新短網址
            </CardTitle>
            <CardDescription>
              為您的長網址生成短連結
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-url">目標網址 *</Label>
                  <Input
                    id="target-url"
                    type="url"
                    placeholder="https://example.com/very-long-url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-slug">自訂代碼（選用）</Label>
                  <Input
                    id="custom-slug"
                    type="text"
                    placeholder="my-custom-slug"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">標題/名稱（選用）</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="連結描述或名稱"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag">分組/標籤（選用）</Label>
                  <Select value={tag} onValueChange={setTag} disabled={isCreating}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇或輸入標籤" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="工作">工作</SelectItem>
                      <SelectItem value="個人">個人</SelectItem>
                      <SelectItem value="行銷">行銷</SelectItem>
                      <SelectItem value="社群媒體">社群媒體</SelectItem>
                      <SelectItem value="測試">測試</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires-at">到期日（選用）</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="click-limit">點擊上限（選用）</Label>
                  <Input
                    id="click-limit"
                    type="number"
                    min="1"
                    placeholder="例如：100"
                    value={clickLimit}
                    onChange={(e) => setClickLimit(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isCreating}>
                {isCreating ? '建立中...' : '建立短網址'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Links List */}
        <Card>
          <CardHeader>
            <CardTitle>您的短網址</CardTitle>
            <CardDescription>
              管理您建立的短連結並查看分析數據
            </CardDescription>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                尚未建立任何短網址，請在上方建立您的第一個！
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          標題/名稱
                          {getSortIcon('title')}
                        </div>
                      </TableHead>
                      <TableHead>短網址</TableHead>
                      <TableHead>目標網址</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort('tag')}
                      >
                        <div className="flex items-center">
                          分組
                          {getSortIcon('tag')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort('clickCount')}
                      >
                        <div className="flex items-center">
                          點擊數/上限
                          {getSortIcon('clickCount')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort('lastClickAt')}
                      >
                        <div className="flex items-center">
                          最近點擊
                          {getSortIcon('lastClickAt')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort('expiresAt')}
                      >
                        <div className="flex items-center">
                          到期日
                          {getSortIcon('expiresAt')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          建立日期
                          {getSortIcon('createdAt')}
                        </div>
                      </TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">
                              {link.title || link.slug}
                            </div>
                            {link.title && (
                              <div className="text-sm text-gray-500 truncate">
                                {link.slug}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {baseUrl}/{link.slug}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(`${baseUrl}/${link.slug}`)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={link.targetUrl}>
                            {link.targetUrl}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            link.tag ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {link.tag || '無分組'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{link.clickCount}</span>
                            {link.clickLimit && (
                              <>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-600 dark:text-gray-400">{link.clickLimit}</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {link.lastClickAt ? (
                            <div className="text-sm">
                              {new Date(link.lastClickAt).toLocaleDateString('zh-TW')}
                              <div className="text-xs text-gray-500">
                                {new Date(link.lastClickAt).toLocaleTimeString('zh-TW', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">從未</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {link.expiresAt ? (
                            <div className={`text-sm ${
                              new Date(link.expiresAt) < new Date() 
                                ? 'text-red-600 dark:text-red-400' 
                                : new Date(link.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {new Date(link.expiresAt).toLocaleDateString('zh-TW')}
                            </div>
                          ) : (
                            <span className="text-gray-400">永久</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(link.createdAt).toLocaleDateString('zh-TW')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowQrCode(showQrCode === link.id ? null : link.id)}
                            >
                              <QrCode className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/analytics/${link.id}`)}
                            >
                              <BarChart className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <a
                                href={`${baseUrl}/${link.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* QR Code Display */}
                {showQrCode && (
                  <div className="mt-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">QR Code</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowQrCode(null)}
                        >
                          ✕
                        </Button>
                      </div>
                      <QRCodeGenerator 
                        url={`${baseUrl}/${links.find(l => l.id === showQrCode)?.slug}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}