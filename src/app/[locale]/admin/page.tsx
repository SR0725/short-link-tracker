'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, ExternalLink, BarChart, Copy, LogOut } from 'lucide-react'

interface Link {
  id: string
  slug: string
  targetUrl: string
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
  const [error, setError] = useState('')
  const router = useRouter()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      const response = await fetch('/api/links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data)
      }
    } catch (error) {
      console.error('Failed to load links:', error)
    }
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
          customSlug: customSlug || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTargetUrl('')
        setCustomSlug('')
        loadLinks() // Refresh the list
      } else {
        setError(data.error || 'Failed to create short URL')
      }
    } catch {
      setError('Network error. Please try again.')
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
            <h1 className="text-3xl font-bold">Short URL Manager</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage your short URLs
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Create New Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create New Short URL
            </CardTitle>
            <CardDescription>
              Generate a short link for your long URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-url">Target URL *</Label>
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
                  <Label htmlFor="custom-slug">Custom Slug (optional)</Label>
                  <Input
                    id="custom-slug"
                    type="text"
                    placeholder="my-custom-slug"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
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
                {isCreating ? 'Creating...' : 'Create Short URL'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Links List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Short URLs</CardTitle>
            <CardDescription>
              Manage your created short links and view analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No short URLs created yet. Create your first one above!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short URL</TableHead>
                    <TableHead>Target URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id}>
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
                        <span className="font-medium">{link.clickCount}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(link.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/analytics/${link.id}`)}
                          >
                            <BarChart className="w-4 h-4 mr-1" />
                            Analytics
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
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Visit
                            </a>
                          </Button>
                        </div>
                      </TableCell>
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