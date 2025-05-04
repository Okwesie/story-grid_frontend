"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { adminApi, type DashboardMetrics } from "@/lib/admin-api"
import {
  BarChart3,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSidebar } from "@/app/admin/components/admin-sidebar"

export default function AdminDashboard() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "admin") {
      router.push("/dashboard")
      return
    }

    fetchDashboardData()
  }, [isAuthenticated, user, router])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminApi.getDashboardMetrics()
      const d = response.data

      // Map backend structure to flat metrics object
      const mappedMetrics = {
        totalUsers: d.users?.total ?? 0,
        activeUsers: d.users?.active ?? 0,
        blockedUsers: d.users?.blocked ?? 0,
        newUsersToday: d.users?.newLastWeek ?? 0, // adjust if you have a "today" field
        totalStories: d.stories?.total ?? 0,
        publishedStories: d.stories?.published ?? 0,
        draftStories: d.stories?.draft ?? 0,
        archivedStories: d.stories?.archived ?? 0,
        newStoriesThisWeek: d.stories?.newLastWeek ?? 0,
        totalComments: d.engagement?.comments?.total ?? 0,
        totalLikes: d.engagement?.likes ?? 0,
        totalMessages: d.engagement?.messages ?? 0,
        totalConversations: d.engagement?.conversations ?? 0,
        // Add more as needed
      }

      setMetrics(mappedMetrics)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Dashboard error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard metrics")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a192f] p-6">
        <div className="max-w-4xl mx-auto bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Error Loading Dashboard</h3>
          <p className="mb-4">{error}</p>
          <Button className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-56 p-8">
        <div className="p-6 bg-[#0a192f] min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-[#8892b0]">
                  {lastUpdated ? <>Last updated: {lastUpdated.toLocaleTimeString()}</> : <>Loading dashboard data...</>}
                </p>
              </div>
              <Button className="mt-4 md:mt-0 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#8892b0]">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-[#f3d34a] mr-2" />
                    <span className="text-2xl font-bold">{metrics?.totalUsers.toLocaleString() || "0"}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] mt-1">
                    <span className="text-green-500">+{metrics?.newUsersToday || 0}</span> new today
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#8892b0]">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-[#f3d34a] mr-2" />
                    <span className="text-2xl font-bold">{metrics?.activeUsers.toLocaleString() || "0"}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] mt-1">
                    {metrics ? (
                      <>{Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}% of total users</>
                    ) : (
                      <>0% of total users</>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#8892b0]">Total Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-[#f3d34a] mr-2" />
                    <span className="text-2xl font-bold">{metrics?.totalStories.toLocaleString() || "0"}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] mt-1">
                    <span className="text-green-500">+{metrics?.newStoriesThisWeek || 0}</span> this week
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#8892b0]">Total Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-[#f3d34a] mr-2" />
                    <span className="text-2xl font-bold">{metrics?.totalComments.toLocaleString() || "0"}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] mt-1">
                    {metrics ? (
                      <>{(metrics.totalComments / metrics.totalStories).toFixed(1)} per story avg.</>
                    ) : (
                      <>0 per story avg.</>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="bg-[#112240] border-[#1d3557] text-white lg:col-span-2">
                <CardHeader>
                  <CardTitle>Content Overview</CardTitle>
                  <CardDescription className="text-[#8892b0]">Distribution of content by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    {metrics ? (
                      <div className="w-full space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white">Published</span>
                            <span className="text-[#8892b0]">{metrics.publishedStories.toLocaleString()} stories</span>
                          </div>
                          <Progress
                            value={(metrics.publishedStories / metrics.totalStories) * 100}
                            className="h-2 bg-green-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white">Drafts</span>
                            <span className="text-[#8892b0]">{metrics.draftStories.toLocaleString()} stories</span>
                          </div>
                          <Progress
                            value={(metrics.draftStories / metrics.totalStories) * 100}
                            className="h-2 bg-[#1d3557] relative overflow-hidden"
                            style={{ '--progress-indicator-color': '#f3d34a' } as React.CSSProperties}
                          />
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                          <div className="bg-[#1d3557] p-4 rounded-lg">
                            <div className="text-[#8892b0] text-sm mb-1">Likes per Story</div>
                            <div className="text-xl font-bold text-white">
                              {(metrics.totalLikes / metrics.publishedStories).toFixed(1)}
                            </div>
                          </div>

                          <div className="bg-[#1d3557] p-4 rounded-lg">
                            <div className="text-[#8892b0] text-sm mb-1">Comments per Story</div>
                            <div className="text-xl font-bold text-white">
                              {(metrics.totalComments / metrics.publishedStories).toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-[#8892b0]">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No content data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription className="text-[#8892b0]">Platform performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8892b0]">User Engagement</span>
                      <span className="text-white font-medium">
                        {metrics ? <>{Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}%</> : <>0%</>}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#8892b0]">Content Creation Rate</span>
                      <span className="text-white font-medium">
                        {metrics ? <>{(metrics.newStoriesThisWeek / 7).toFixed(1)}/day</> : <>0/day</>}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#8892b0]">Avg. Stories per User</span>
                      <span className="text-white font-medium">
                        {metrics ? <>{(metrics.totalStories / metrics.totalUsers).toFixed(1)}</> : <>0</>}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#8892b0]">Completion Rate</span>
                      <span className="text-white font-medium">
                        {metrics ? <>{Math.round((metrics.publishedStories / metrics.totalStories) * 100)}%</> : <>0%</>}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#1d3557]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-[#f3d34a] mr-2" />
                        <span className="text-[#8892b0]">Last 30 Days</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500">+12.5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="users" className="w-full">
              <TabsList className="bg-[#112240] w-full justify-start mb-6">
                <TabsTrigger value="users" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]">
                  Recent Users
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]"
                >
                  Recent Content
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]"
                >
                  System Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <Card className="bg-[#112240] border-[#1d3557] text-white">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent User Registrations</CardTitle>
                      <Button
                        variant="link"
                        className="text-[#f3d34a] p-0"
                        onClick={() => router.push("/admin/user-management")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
                            <th className="pb-3 font-medium">Username</th>
                            <th className="pb-3 font-medium">Email</th>
                            <th className="pb-3 font-medium">Role</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Registered</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Mock data for recent users */}
                          {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-[#1d3557]">
                              <td className="py-3">user{i + 1}</td>
                              <td className="py-3">user{i + 1}@example.com</td>
                              <td className="py-3">{i === 0 ? "admin" : "user"}</td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    i % 3 === 0 ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-500"
                                  }`}
                                >
                                  {i % 3 === 0 ? "pending" : "active"}
                                </span>
                              </td>
                              <td className="py-3 text-[#8892b0]">
                                {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content">
                <Card className="bg-[#112240] border-[#1d3557] text-white">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recently Published Content</CardTitle>
                      <Button
                        variant="link"
                        className="text-[#f3d34a] p-0"
                        onClick={() => router.push("/admin/content-management")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
                            <th className="pb-3 font-medium">Title</th>
                            <th className="pb-3 font-medium">Author</th>
                            <th className="pb-3 font-medium">Type</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Published</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Mock data for recent content */}
                          {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-[#1d3557]">
                              <td className="py-3">Story Title {i + 1}</td>
                              <td className="py-3">author{i + 1}</td>
                              <td className="py-3">{["visual", "audio", "video", "interactive"][i % 4]}</td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    i % 4 === 0
                                      ? "bg-yellow-500/20 text-yellow-500"
                                      : i % 4 === 1
                                        ? "bg-green-500/20 text-green-500"
                                        : "bg-blue-500/20 text-blue-500"
                                  }`}
                                >
                                  {i % 4 === 0 ? "pending" : i % 4 === 1 ? "published" : "draft"}
                                </span>
                              </td>
                              <td className="py-3 text-[#8892b0]">
                                {i % 4 === 1 ? new Date(Date.now() - i * 86400000).toLocaleDateString() : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="bg-[#112240] border-[#1d3557] text-white">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>System Activity Log</CardTitle>
                      <Button
                        variant="link"
                        className="text-[#f3d34a] p-0"
                        onClick={() => router.push("/admin/system-logs")}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-[#1d3557]/50">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              i % 3 === 0
                                ? "bg-yellow-500/20 text-yellow-500"
                                : i % 3 === 1
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-blue-500/20 text-blue-500"
                            }`}
                          >
                            {i % 3 === 0 ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : i % 3 === 1 ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-white">
                              {i % 3 === 0 ? "System alert: " : i % 3 === 1 ? "User action: " : "System update: "}
                              <span className="text-[#8892b0]">
                                {i % 3 === 0
                                  ? "High server load detected"
                                  : i % 3 === 1
                                    ? "Admin user updated content settings"
                                    : "Database backup completed successfully"}
                              </span>
                            </p>
                            <p className="text-xs text-[#8892b0] mt-1">
                              {new Date(Date.now() - i * 3600000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
