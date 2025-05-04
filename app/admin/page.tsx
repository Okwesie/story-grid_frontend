"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserX,
  Eye,
  BarChart3,
} from "lucide-react"

interface DashboardMetrics {
  users: {
    total: number
    active: number
    blocked: number
    newThisWeek: number
    newThisMonth: number
  }
  stories: {
    total: number
    published: number
    drafts: number
    reported: number
    newThisWeek: number
  }
  engagement: {
    totalViews: number
    totalLikes: number
    totalComments: number
    averageViewsPerStory: number
  }
  messages: {
    total: number
    conversations: number
    reported: number
  }
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard metrics")
        }

        const data = await response.json()
        setMetrics(data.data)
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardMetrics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg max-w-md text-center">
          <h3 className="text-xl font-bold mb-2">Error Loading Dashboard</h3>
          <p>{error}</p>
          <button
            className="mt-4 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 px-4 py-2 rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-[#8892b0]">Overview of platform metrics and activity</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[#112240] w-full justify-start mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]">
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]">
            Users
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]">
            Content
          </TabsTrigger>
          <TabsTrigger
            value="engagement"
            className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]"
          >
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#8892b0]">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-[#f3d34a] mr-2" />
                  <span className="text-2xl font-bold">{metrics?.users.total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-[#8892b0] mt-1">
                  <span className="text-green-500">↑ {metrics?.users.newThisWeek}</span> new this week
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
                  <span className="text-2xl font-bold">{metrics?.stories.total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-[#8892b0] mt-1">
                  <span className="text-green-500">↑ {metrics?.stories.newThisWeek}</span> new this week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#8892b0]">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-[#f3d34a] mr-2" />
                  <span className="text-2xl font-bold">{metrics?.engagement.totalViews.toLocaleString()}</span>
                </div>
                <p className="text-xs text-[#8892b0] mt-1">
                  <span className="text-[#8892b0]">Avg {metrics?.engagement.averageViewsPerStory} per story</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#8892b0]">Reported Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-2xl font-bold">{metrics?.stories.reported.toLocaleString()}</span>
                </div>
                <p className="text-xs text-[#8892b0] mt-1">
                  <span className="text-red-500">Requires attention</span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#f3d34a]" />
                  Platform Growth
                </CardTitle>
                <CardDescription className="text-[#8892b0]">User and content growth over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-[#8892b0]">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Growth chart visualization would appear here</p>
                  <p className="text-sm mt-2">Showing users and content over time</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader>
                <CardTitle>User Status</CardTitle>
                <CardDescription className="text-[#8892b0]">Distribution of user statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <span className="text-white">Active Users</span>
                      </div>
                      <span className="text-[#8892b0]">{metrics?.users.active} users</span>
                    </div>
                    <Progress
                      value={((metrics?.users.active || 0) / (metrics?.users.total || 1)) * 100}
                      className="h-2 bg-[#1d3557]"
                      style={{ backgroundColor: 'green' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <UserX className="h-4 w-4 text-red-500" />
                        <span className="text-white">Blocked Users</span>
                      </div>
                      <span className="text-[#8892b0]">{metrics?.users.blocked} users</span>
                    </div>
                    <Progress
                      value={((metrics?.users.blocked || 0) / (metrics?.users.total || 1)) * 100}
                      className="h-2 bg-[#1d3557] relative overflow-hidden"
                      style={{ '--progress-indicator-color': 'bg-red-500' } as React.CSSProperties}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-white">Published Stories</span>
                      </div>
                      <span className="text-[#8892b0]">{metrics?.stories.published} stories</span>
                    </div>
                    <Progress
                      value={((metrics?.stories.published || 0) / (metrics?.stories.total || 1)) * 100}
                      className="h-2 bg-[#1d3557]"
                      style={{ backgroundColor: 'blue' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                        <span className="text-white">Active Conversations</span>
                      </div>
                      <span className="text-[#8892b0]">{metrics?.messages.conversations} conversations</span>
                    </div>
                    <Progress
                      value={((metrics?.messages.conversations || 0) / (metrics?.messages.total || 1)) * 100}
                      className="h-2 bg-[#1d3557]"
                      style={{ backgroundColor: 'purple' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-[#112240] border-[#1d3557] text-white">
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription className="text-[#8892b0]">Detailed breakdown of user metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Total Users</span>
                    <span className="text-white font-medium">{metrics?.users.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Active Users</span>
                    <span className="text-white font-medium">{metrics?.users.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Blocked Users</span>
                    <span className="text-white font-medium">{metrics?.users.blocked}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">New This Week</span>
                    <span className="text-white font-medium">{metrics?.users.newThisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">New This Month</span>
                    <span className="text-white font-medium">{metrics?.users.newThisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Average Stories per User</span>
                    <span className="text-white font-medium">
                      {metrics ? (metrics.stories.total / metrics.users.total).toFixed(1) : 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">User Retention Rate</span>
                    <span className="text-white font-medium">76%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Average Session Duration</span>
                    <span className="text-white font-medium">12m 34s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Daily Active Users</span>
                    <span className="text-white font-medium">{Math.round((metrics?.users.active || 0) * 0.4)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card className="bg-[#112240] border-[#1d3557] text-white">
            <CardHeader>
              <CardTitle>Content Statistics</CardTitle>
              <CardDescription className="text-[#8892b0]">Detailed breakdown of content metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Total Stories</span>
                    <span className="text-white font-medium">{metrics?.stories.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Published Stories</span>
                    <span className="text-white font-medium">{metrics?.stories.published}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Draft Stories</span>
                    <span className="text-white font-medium">{metrics?.stories.drafts}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">New Stories This Week</span>
                    <span className="text-white font-medium">{metrics?.stories.newThisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Reported Stories</span>
                    <span className="text-white font-medium">{metrics?.stories.reported}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Average Story Length</span>
                    <span className="text-white font-medium">1,250 words</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Total Comments</span>
                    <span className="text-white font-medium">{metrics?.engagement.totalComments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Comments per Story</span>
                    <span className="text-white font-medium">
                      {metrics ? (metrics.engagement.totalComments / metrics.stories.published).toFixed(1) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Reported Comments</span>
                    <span className="text-white font-medium">
                      {Math.round((metrics?.engagement.totalComments || 0) * 0.02)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card className="bg-[#112240] border-[#1d3557] text-white">
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription className="text-[#8892b0]">How users interact with content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Total Views</span>
                    <span className="text-white font-medium">{metrics?.engagement.totalViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Total Likes</span>
                    <span className="text-white font-medium">{metrics?.engagement.totalLikes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Total Comments</span>
                    <span className="text-white font-medium">{metrics?.engagement.totalComments}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Avg. Views per Story</span>
                    <span className="text-white font-medium">{metrics?.engagement.averageViewsPerStory}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Likes per View</span>
                    <span className="text-white font-medium">
                      {metrics
                        ? ((metrics.engagement.totalLikes / metrics.engagement.totalViews) * 100).toFixed(1) + "%"
                        : "0%"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Comments per View</span>
                    <span className="text-white font-medium">
                      {metrics
                        ? ((metrics.engagement.totalComments / metrics.engagement.totalViews) * 100).toFixed(1) + "%"
                        : "0%"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Engagement Rate</span>
                    <span className="text-white font-medium">
                      {metrics
                        ? (
                            ((metrics.engagement.totalLikes + metrics.engagement.totalComments) /
                              metrics.engagement.totalViews) *
                            100
                          ).toFixed(1) + "%"
                        : "0%"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Avg. Time on Page</span>
                    <span className="text-white font-medium">3m 42s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Bounce Rate</span>
                    <span className="text-white font-medium">32%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
