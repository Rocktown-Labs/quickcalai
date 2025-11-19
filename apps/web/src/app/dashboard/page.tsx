import Uploader from "@/components/uploader"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getDashboardStats } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Files, Calendar, CheckCircle, Download, FileImage } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const { isAuthenticated } = await auth()

  if (!isAuthenticated) {
    return <div>You are not authenticated, please sign in</div>
  }

  const user = await currentUser()
  const stats = await getDashboardStats()

  return (
    <div className="p-8">
      <div className="container mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.firstName || user?.username || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to extract calendar events from your images?
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
              <Files className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUploads}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedUploads} successfully processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Extracted</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Calendar events created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalUploads > 0
                  ? Math.round((stats.completedUploads / stats.totalUploads) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Processing success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Calendar Extraction Section */}
        <div>
          <div className="mb-6">


          <Uploader />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileImage className="w-5 h-5" />
                <span>View Media Gallery</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Browse all your uploaded images and extracted calendar events
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard/media">View Media</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Manage Files</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Download, share, and manage your processed calendar files
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/files">Manage Files</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {stats.recentUploads.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="font-serif font-bold text-2xl text-foreground mb-2">Recent Activity</h2>
              <p className="text-muted-foreground">Your latest uploads and processing results</p>
            </div>

            <div className="space-y-4">
              {stats.recentUploads.map((upload) => (
                <Card key={upload.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileImage className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{upload.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {upload.eventCount} events extracted • {new Date(upload.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={upload.status === 'completed' ? 'default' : 'secondary'}
                          className={
                            upload.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : upload.status === 'processing'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }
                        >
                          {upload.status}
                        </Badge>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/media`}>
                            <Download className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
