"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { api, type Story } from "@/lib/api"
import {
  Bell,
  Search,
  Plus,
  TrendingUp,
  Clock,
  Heart,
  MessageSquare,
  Eye,
  BarChart3,
  Bookmark,
  Play,
  Headphones,
  ImageIcon,
  Type,
  Settings,
  ChevronRight,
  Zap,
  Users,
  Star,
  Share2,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// Helper function to get icon based on content type
const getTypeIcon = (type: Story["type"]) => {
  switch (type) {
    case "visual":
      return <ImageIcon className="h-4 w-4" />
    case "audio":
      return <Headphones className="h-4 w-4" />
    case "video":
      return <Play className="h-4 w-4" />
    case "interactive":
      return <Type className="h-4 w-4" />
    default:
      return <ImageIcon className="h-4 w-4" />
  }
}

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentStories, setRecentStories] = useState<Story[]>([])
  const [draftStories, setDraftStories] = useState<Story[]>([])
  const [recommendedStories, setRecommendedStories] = useState<Story[]>([])
  const [stats, setStats] = useState({
    views: 0,
    likes: 0,
    comments: 0,
    followers: 0,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch dashboard data
        const dashboardResponse = await api.stories.getDashboardStories()
        const recommendedResponse = await api.stories.getRecommendedStories()

        console.log("Dashboard response:", dashboardResponse)
        console.log("Recommended response:", recommendedResponse)

        // Set stories data
        setRecentStories(dashboardResponse.data?.recentPublished ?? [])
        setDraftStories(dashboardResponse.data?.recentDrafts ?? [])
        setRecommendedStories(recommendedResponse.data?.stories ?? [])

        // Calculate total stats from recent stories
        const totalViews =
          dashboardResponse.data?.recentPublished?.reduce((sum, story) => sum + (story.views || 0), 0) || 0
        const totalLikes =
          dashboardResponse.data?.recentPublished?.reduce((sum, story) => sum + (story.likes || 0), 0) || 0
        const totalComments =
          dashboardResponse.data?.recentPublished?.reduce((sum, story) => sum + (story.comments || 0), 0) || 0

        setStats({
          views: totalViews,
          likes: totalLikes,
          comments: totalComments,
          followers: 0, // This would come from a different API call if available
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        setError(error instanceof Error ? error.message : "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg max-w-md text-center">
          <h3 className="text-xl font-bold mb-2">Error Loading Dashboard</h3>
          <p>{error}</p>
          <Button
            className="mt-4 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col">
      {/* Header */}
      <header className="bg-[#0a192f] border-b border-[#1d3557] p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/dashboard">
            <h1 className="text-[#f3d34a] text-2xl font-bold">StoryGrid</h1>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex relative max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
            <Input
              placeholder="Search stories, creators, tags..."
              className="pl-10 bg-[#112240] border-[#1d3557] text-white focus-visible:ring-[#f3d34a] w-full"
            />
          </div>

          <nav className="flex items-center space-x-2 md:space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-[#f3d34a]">
                Home
              </Button>
            </Link>
            <Link href="/feed_page">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">
                Explore
              </Button>
            </Link>
            <Link href="/friend_requests">
              <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a] relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">
                Messages
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">
                Profile
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back, {user?.username || "User"}</h2>
            <p className="text-[#8892b0]">Here's what's happening with your stories</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link href="/create-story">
              <Button className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Story
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-[#112240] w-full justify-start mb-6">
            <TabsTrigger
              value="overview"
              className={activeTab === "overview" ? "bg-[#0a192f] text-[#f3d34a]" : "text-[#8892b0]"}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className={activeTab === "content" ? "bg-[#0a192f] text-[#f3d34a]" : "text-[#8892b0]"}
            >
              My Content
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className={activeTab === "analytics" ? "bg-[#0a192f] text-[#f3d34a]" : "text-[#8892b0]"}
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className={activeTab === "notifications" ? "bg-[#0a192f] text-[#f3d34a]" : "text-[#8892b0]"}
            >
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#8892b0]">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-[#f3d34a] mr-2" />
                    <span className="text-2xl font-bold">{stats.views.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] mt-1">
                    <span className="text-green-500">↑ 12%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#8892b0]">Total Likes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-[#f3d34a] mr-2" />
                    <span className="text-2xl font-bold">{stats.likes.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] mt-1">
                    <span className="text-green-500">↑ 8%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#8892b0]">Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-[#f3d34a] mr-2" />
                    <span className="text-2xl font-bold">{stats.comments.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] mt-1">
                    <span className="text-green-500">↑ 5%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#8892b0]">Followers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-[#f3d34a] mr-2" />
                    <span className="text-2xl font-bold">{stats.followers.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] mt-1">
                    <span className="text-green-500">↑ 15%</span> from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Drafts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Stories */}
              <Card className="bg-[#112240] border-[#1d3557] text-white lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Stories</CardTitle>
                    <Link href="/profile-page" className="text-[#f3d34a] text-sm hover:underline">
                      View All
                    </Link>
                  </div>
                  <CardDescription className="text-[#8892b0]">Your recently published stories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentStories.length === 0 ? (
                      <div className="text-center py-8">
                        <ImageIcon className="h-12 w-12 mx-auto text-[#8892b0] mb-3 opacity-50" />
                        <p className="text-[#8892b0]">You haven't published any stories yet.</p>
                        <Link href="/create-story">
                          <Button className="mt-4 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90">
                            Create Your First Story
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      recentStories.map((story) => (
                        <div key={story.id} className="flex gap-4 items-center">
                          <div className="relative h-16 w-24 rounded-md overflow-hidden bg-[#1d3557] flex-shrink-0">
                            <img
                              src={story.thumbnail || "/placeholder.svg?height=80&width=120"}
                              alt={story.title || "Story"}
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute top-1 left-1 bg-[#0a192f]/80 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                              {getTypeIcon(story.type)}
                              <span className="text-[10px] capitalize">{story.type}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{story.title || "Untitled Story"}</h4>
                            <div className="flex items-center gap-3 text-xs text-[#8892b0] mt-1">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{story.views || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                <span>{story.likes || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{story.comments || 0}</span>
                              </div>
                              <span className="ml-auto">{story.timeAgo || "Recently"}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Drafts */}
              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Drafts</CardTitle>
                    <Link href="/drafts" className="text-[#f3d34a] text-sm hover:underline">
                      View All
                    </Link>
                  </div>
                  <CardDescription className="text-[#8892b0]">Continue where you left off</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {draftStories.length === 0 ? (
                      <div className="text-center py-6">
                        <FileText className="h-10 w-10 mx-auto text-[#8892b0] mb-2 opacity-50" />
                        <p className="text-[#8892b0]">No drafts found</p>
                      </div>
                    ) : (
                      draftStories.map((draft) => (
                        <div
                          key={draft.id}
                          className="flex items-center gap-3 p-3 rounded-md bg-[#1d3557] hover:bg-[#1d3557]/80 transition-colors cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-md bg-[#0a192f] flex items-center justify-center">
                            {getTypeIcon(draft.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">{draft.title || "Untitled Draft"}</h4>
                            <p className="text-xs text-[#8892b0]">Last edited {draft.lastEdited || "recently"}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-[#8892b0]" />
                        </div>
                      ))
                    )}
                    <Link href="/create-story">
                      <Button
                        variant="outline"
                        className="w-full border-dashed border-[#1d3557] text-[#8892b0] hover:bg-[#1d3557] hover:text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Draft
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Stories */}
            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#f3d34a]" />
                  Recommended for You
                </CardTitle>
                <CardDescription className="text-[#8892b0]">Based on your interests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedStories.length === 0 ? (
                    <div className="col-span-3 text-center py-8">
                      <Zap className="h-12 w-12 mx-auto text-[#8892b0] mb-3 opacity-50" />
                      <p className="text-[#8892b0]">No recommendations available yet.</p>
                      <p className="text-xs text-[#8892b0] mt-2">
                        Explore more stories to get personalized recommendations.
                      </p>
                    </div>
                  ) : (
                    recommendedStories.map((story) => (
                      <div
                        key={story.id}
                        className="bg-[#1d3557] rounded-lg overflow-hidden hover:translate-y-[-2px] transition-transform"
                      >
                        <div className="relative h-32">
                          <img
                            src={story.thumbnail || "/placeholder.svg?height=120&width=200"}
                            alt={story.title || "Story"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-[#0a192f]/80 px-2 py-1 rounded-md flex items-center gap-1">
                            {getTypeIcon(story.type)}
                            <span className="text-xs capitalize">{story.type}</span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-white truncate">{story.title || "Untitled Story"}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={"/placeholder.svg?height=32&width=32"}
                                alt={story.author?.username || "Author"}
                              />
                              <AvatarFallback className="bg-[#0a192f] text-[#f3d34a] text-xs">
                                {story.author?.username ? story.author.username[0].toUpperCase() : "A"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-[#8892b0]">{story.author?.username || "Unknown Author"}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/explore" className="text-[#f3d34a] text-sm hover:underline w-full text-center">
                  Discover More Stories
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* My Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Content Stats */}
              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader>
                  <CardTitle>Content Overview</CardTitle>
                  <CardDescription className="text-[#8892b0]">Summary of your content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Published Stories</span>
                    <span className="text-white font-medium">{recentStories.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Drafts</span>
                    <span className="text-white font-medium">{draftStories.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Collections</span>
                    <span className="text-white font-medium">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8892b0]">Collaborations</span>
                    <span className="text-white font-medium">0</span>
                  </div>
                </CardContent>
              </Card>

              {/* Content Types */}
              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader>
                  <CardTitle>Content Types</CardTitle>
                  <CardDescription className="text-[#8892b0]">Distribution by media type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Calculate type distribution */}
                  {(() => {
                    const allStories = [...recentStories, ...draftStories]
                    const typeCount = {
                      visual: allStories.filter((s) => s.type === "visual").length,
                      audio: allStories.filter((s) => s.type === "audio").length,
                      video: allStories.filter((s) => s.type === "video").length,
                      interactive: allStories.filter((s) => s.type === "interactive").length,
                    }
                    const total = allStories.length || 1 // Avoid division by zero

                    return (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-[#f3d34a]" />
                              <span className="text-white">Visual</span>
                            </div>
                            <span className="text-[#8892b0]">{typeCount.visual} stories</span>
                          </div>
                          <Progress
                            value={(typeCount.visual / total) * 100}
                            className="h-2 bg-[#1d3557]"
                            indicatorClassName="bg-[#f3d34a]"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Headphones className="h-4 w-4 text-[#f3d34a]" />
                              <span className="text-white">Audio</span>
                            </div>
                            <span className="text-[#8892b0]">{typeCount.audio} stories</span>
                          </div>
                          <Progress
                            value={(typeCount.audio / total) * 100}
                            className="h-2 bg-[#1d3557]"
                            indicatorClassName="bg-[#f3d34a]"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Play className="h-4 w-4 text-[#f3d34a]" />
                              <span className="text-white">Video</span>
                            </div>
                            <span className="text-[#8892b0]">{typeCount.video} stories</span>
                          </div>
                          <Progress
                            value={(typeCount.video / total) * 100}
                            className="h-2 bg-[#1d3557]"
                            indicatorClassName="bg-[#f3d34a]"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Type className="h-4 w-4 text-[#f3d34a]" />
                              <span className="text-white">Interactive</span>
                            </div>
                            <span className="text-[#8892b0]">{typeCount.interactive} stories</span>
                          </div>
                          <Progress
                            value={(typeCount.interactive / total) * 100}
                            className="h-2 bg-[#1d3557]"
                            indicatorClassName="bg-[#f3d34a]"
                          />
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader>
                  <CardTitle>Your Popular Tags</CardTitle>
                  <CardDescription className="text-[#8892b0]">Most used tags in your stories</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Extract and count tags from stories */}
                  {(() => {
                    const allStories = [...recentStories, ...draftStories]
                    const tagCounts: Record<string, number> = {}

                    allStories.forEach((story) => {
                      if (story.tags && Array.isArray(story.tags)) {
                        story.tags.forEach((tag) => {
                          tagCounts[tag] = (tagCounts[tag] || 0) + 1
                        })
                      }
                    })

                    // Sort tags by count and take top ones
                    const sortedTags = Object.entries(tagCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 9)

                    return (
                      <div className="flex flex-wrap gap-2">
                        {sortedTags.length > 0 ? (
                          sortedTags.map(([tag, count]) => (
                            <Badge key={tag} className="bg-[#1d3557] text-[#f3d34a] px-3 py-1">
                              {tag} ({count})
                            </Badge>
                          ))
                        ) : (
                          <p className="text-[#8892b0] text-center w-full py-2">No tags found in your stories</p>
                        )}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Content */}
            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader>
                <CardTitle>Top Performing Stories</CardTitle>
                <CardDescription className="text-[#8892b0]">Your most popular content</CardDescription>
              </CardHeader>
              <CardContent>
                {recentStories.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
                          <th className="pb-3 font-medium">Story</th>
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium">Views</th>
                          <th className="pb-3 font-medium">Likes</th>
                          <th className="pb-3 font-medium">Comments</th>
                          <th className="pb-3 font-medium">Engagement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentStories
                          .sort((a, b) => (b.views || 0) - (a.views || 0))
                          .slice(0, 5)
                          .map((story) => {
                            // Calculate engagement level
                            const views = story.views || 0
                            const likes = story.likes || 0
                            const comments = story.comments || 0
                            const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0
                            let engagementLevel = "Low"
                            let engagementColor = "blue-500"

                            if (engagement > 10) {
                              engagementLevel = "High"
                              engagementColor = "green-500"
                            } else if (engagement > 5) {
                              engagementLevel = "Medium"
                              engagementColor = "yellow-500"
                            }

                            return (
                              <tr key={story.id} className="border-b border-[#1d3557]">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-[#1d3557] flex items-center justify-center">
                                      {getTypeIcon(story.type)}
                                    </div>
                                    <span className="font-medium">{story.title || "Untitled"}</span>
                                  </div>
                                </td>
                                <td className="py-3 capitalize">{story.type || "Unknown"}</td>
                                <td className="py-3">{views.toLocaleString()}</td>
                                <td className="py-3">{likes.toLocaleString()}</td>
                                <td className="py-3">{comments.toLocaleString()}</td>
                                <td className="py-3">
                                  <Badge className={`bg-${engagementColor}/20 text-${engagementColor}`}>
                                    {engagementLevel}
                                  </Badge>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-[#8892b0] mb-3 opacity-50" />
                    <p className="text-[#8892b0]">No published stories to analyze</p>
                    <p className="text-xs text-[#8892b0] mt-2">Publish stories to see performance analytics</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/analytics" className="text-[#f3d34a] text-sm hover:underline w-full text-center">
                  View Detailed Analytics
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Overview */}
              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#f3d34a]" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription className="text-[#8892b0]">Last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-[#8892b0]">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Analytics chart visualization would appear here</p>
                    <p className="text-sm mt-2">Showing views, likes, and comments over time</p>
                  </div>
                </CardContent>
              </Card>

              {/* Audience Insights */}
              <Card className="bg-[#112240] border-[#1d3557] text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#f3d34a]" />
                    Audience Insights
                  </CardTitle>
                  <CardDescription className="text-[#8892b0]">Who's engaging with your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-[#8892b0]">Age Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span>18-24</span>
                          <span>28%</span>
                        </div>
                        <Progress value={28} className="h-2 bg-[#1d3557]" indicatorClassName="bg-[#f3d34a]" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span>25-34</span>
                          <span>42%</span>
                        </div>
                        <Progress value={42} className="h-2 bg-[#1d3557]" indicatorClassName="bg-[#f3d34a]" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span>35-44</span>
                          <span>18%</span>
                        </div>
                        <Progress value={18} className="h-2 bg-[#1d3557]" indicatorClassName="bg-[#f3d34a]" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span>45+</span>
                          <span>12%</span>
                        </div>
                        <Progress value={12} className="h-2 bg-[#1d3557]" indicatorClassName="bg-[#f3d34a]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-[#8892b0]">Top Locations</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between items-center">
                          <span>United States</span>
                          <span className="text-[#f3d34a]">42%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>United Kingdom</span>
                          <span className="text-[#f3d34a]">15%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Canada</span>
                          <span className="text-[#f3d34a]">12%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Australia</span>
                          <span className="text-[#f3d34a]">8%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Germany</span>
                          <span className="text-[#f3d34a]">6%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Other</span>
                          <span className="text-[#f3d34a]">17%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Metrics */}
            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription className="text-[#8892b0]">How users interact with your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-[#f3d34a]" />
                        <span className="text-white">Avg. View Time</span>
                      </div>
                      <span className="text-white font-medium">3:24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-[#f3d34a]" />
                        <span className="text-white">Like Rate</span>
                      </div>
                      <span className="text-white font-medium">8.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-[#f3d34a]" />
                        <span className="text-white">Comment Rate</span>
                      </div>
                      <span className="text-white font-medium">2.7%</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4 text-[#f3d34a]" />
                        <span className="text-white">Save Rate</span>
                      </div>
                      <span className="text-white font-medium">5.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-[#f3d34a]" />
                        <span className="text-white">Share Rate</span>
                      </div>
                      <span className="text-white font-medium">3.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#f3d34a]" />
                        <span className="text-white">Follow Rate</span>
                      </div>
                      <span className="text-white font-medium">1.8%</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-[#f3d34a]" />
                        <span className="text-white">Avg. Rating</span>
                      </div>
                      <span className="text-white font-medium">4.7/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#f3d34a]" />
                        <span className="text-white">Bounce Rate</span>
                      </div>
                      <span className="text-white font-medium">24%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#f3d34a]" />
                        <span className="text-white">Growth Rate</span>
                      </div>
                      <span className="text-white font-medium">+12%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/analytics/detailed" className="text-[#f3d34a] text-sm hover:underline w-full text-center">
                  View Full Analytics Report
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription className="text-[#8892b0]">Stay updated with your activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample notifications - would be replaced with real data */}
                  <div className="p-4 rounded-lg bg-[#1d3557] flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback className="bg-[#0a192f] text-[#f3d34a]">AR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white">
                        <span className="font-medium">Alex Rivera</span> liked your story 'The Silent Forest'
                      </p>
                      <p className="text-xs text-[#8892b0] mt-1">2 hours ago</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-[#f3d34a] mt-2"></div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#1d3557]/50 flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback className="bg-[#0a192f] text-[#f3d34a]">MC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white">
                        <span className="font-medium">Maria Chen</span> commented on your story 'Urban Soundscapes'
                      </p>
                      <p className="text-xs text-[#8892b0] mt-1">1 day ago</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#1d3557]/50 flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback className="bg-[#0a192f] text-[#f3d34a]">JW</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white">
                        <span className="font-medium">James Wilson</span> started following you
                      </p>
                      <p className="text-xs text-[#8892b0] mt-1">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="border-[#1d3557] text-[#8892b0] hover:text-white">
                  Mark All as Read
                </Button>
                <Link href="/notifications">
                  <Button variant="ghost" className="text-[#f3d34a] hover:text-[#f3d34a]/80">
                    View All Notifications
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
