'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Link as LinkIcon } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const checkExistingAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        if (data.authenticated) {
          router.push('/admin')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    
    checkExistingAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, rememberMe }),
      })

      const data = await response.json()

      console.log('Login response:', response)

      if (response.ok) {
        console.log('Login successful, redirecting to /admin')
        toast.success('登入成功')
        // Add a small delay to ensure cookie is set
        setTimeout(() => {
          window.location.href = '/admin'
        }, 100)
      } else {
        const errorMsg = data.error === 'Invalid password' ? '密碼錯誤' : '網路錯誤，請重試'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch {
      const errorMsg = '網路錯誤，請重試'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Background with gradient animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      <div className="min-h-screen flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md px-8"
        >
          {/* Brand Icon */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 400 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <LinkIcon className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-4xl font-black text-black mb-2">管理員登入</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  請輸入密碼以進入管理後台
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <Label htmlFor="password" className="text-base font-semibold text-black">密碼</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 text-lg border-2 border-gray-200 rounded-2xl focus:border-black focus:ring-0 transition-all duration-300"
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                  >
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      disabled={isLoading}
                      className="w-5 h-5 rounded-md border-2 border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <Label 
                      htmlFor="remember-me" 
                      className="text-base font-medium text-gray-700 cursor-pointer"
                    >
                      記住我 1 年
                    </Label>
                  </motion.div>

                  {error && (
                    <motion.div 
                      className="p-4 bg-red-50 border border-red-200 rounded-2xl"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-base text-red-600 font-medium">
                        {error}
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg font-bold bg-black hover:bg-gray-800 text-white rounded-2xl shadow-2xl hover:shadow-black/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      <motion.div
                        animate={isLoading ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                      >
                        {isLoading ? '登入中...' : '登入'}
                      </motion.div>
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}