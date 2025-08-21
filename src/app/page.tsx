import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Link as LinkIcon, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-4xl font-bold">
            <LinkIcon className="w-10 h-10 text-blue-600" />
            <span>短網址追蹤器</span>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            簡單強大的網址縮短服務，具備完整分析功能
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <LinkIcon className="w-8 h-8 text-blue-600 mx-auto" />
              <CardTitle className="text-lg">縮短網址</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                將長網址轉換為簡短易分享的連結
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart className="w-8 h-8 text-green-600 mx-auto" />
              <CardTitle className="text-lg">追蹤分析</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                監控點擊數、來源和地理位置資料
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Settings className="w-8 h-8 text-purple-600 mx-auto" />
              <CardTitle className="text-lg">管理連結</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                組織和控制您的短網址
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/admin">
              <Settings className="w-5 h-5 mr-2" />
              進入管理後台
            </Link>
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            需要管理員登入才能建立和管理連結
          </p>
        </div>
      </div>
    </div>
  )
}
