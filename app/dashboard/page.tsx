"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { api, type Story, type UserData } from "@/lib/api"
import {
  Bell,
  Search,
  Plus,
  Heart,
  MessageSquare,
  Eye,
  Play,
  Headphones,
  ImageIcon,
  Type,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

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

  useEffect(() => {
    console.log("isAuthenticated:", isAuthenticated)
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Single call to get dashboard data
        const dashboardResponse = await api.stories.getDashboardStories()
        const recommendedResponse = await api.stories.getRecommendedStories()

        setRecentStories(dashboardResponse.data?.recentPublished ?? [])
        setDraftStories(dashboardResponse.data?.recentDrafts ?? [])
        setRecommendedStories(recommendedResponse.data?.stories ?? [])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        setError(error instanceof Error ? error.message : "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated, router])

  useEffect(() => {
    console.log("isAuthenticated in dashboard:", isAuthenticated)
  }, [isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f3d34a]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
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
          <div className="hidden md:flex relative max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
            <Input
              placeholder="Search stories, creators, tags..."
              className="pl-10 bg-[#112240] border-[#1d3557] text-white focus-visible:ring-[#f3d34a] w-full"
            />
          </div>
          <nav className="flex items-center space-x-2 md:space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-[#f3d34a]">Home</Button>
            </Link>
            <Link href="/feed_page">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">Explore</Button>
            </Link>
            <Link href = "/friend_requests">
              <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a] relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">Messages</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="text-white hover:text-[#f3d34a]">Profile</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Welcome back, {user?.username || 'User'}
            </h2>
            <p className="text-[#8892b0]">Here's what's happening with your stories</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link href="/create_story">
              <Button className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Story
              </Button>
            </Link>
            <Link href="/settings">
              <Button className="bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#112240] border border-[#1d3557]">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-[#1d3557]">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-[#1d3557]">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Recent Stories */}
            <Card className="bg-[#112240] border-[#1d3557]">
              <CardHeader>
                <CardTitle className="text-white">Recent Stories</CardTitle>
                <CardDescription className="text-[#8892b0]">
                  Your most recent published stories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentStories.length === 0 ? (
                    <p className="text-[#8892b0] text-center py-4">
                      You haven't published any stories yet.
                      <Link href="/create-story" className="text-[#f3d34a] ml-2 hover:underline">
                        Create your first story
                      </Link>
                    </p>
                  ) : (
                    recentStories.map((story) => (
                      <div key={story.id} className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <img
                            src={story.thumbnail || "/placeholder.svg"}
                            alt={story.title || "Story"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-[#0a192f]/80 px-2 py-1 rounded-full flex items-center gap-1">
                            {getTypeIcon(story.type)}
                            <span className="text-xs text-white capitalize">{story.type}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{story.title || "Untitled"}</h3>
                          <div className="flex items-center gap-4 text-sm text-[#8892b0] mt-1">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {story.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {story.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {story.comments}
                            </span>
                            <span>{story.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Draft Stories */}
            <Card className="bg-[#112240] border-[#1d3557]">
              <CardHeader>
                <CardTitle className="text-white">Draft Stories</CardTitle>
                <CardDescription className="text-[#8892b0]">
                  Continue working on your drafts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {draftStories.length === 0 ? (
                    <p className="text-[#8892b0] text-center py-4">
                      No drafts found.
                    </p>
                  ) : (
                    draftStories.map((story) => (
                      <div key={story.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#1d3557] p-2 rounded-lg">
                            {getTypeIcon(story.type)}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{story.title}</h3>
                            <p className="text-sm text-[#8892b0]">Last edited {story.lastEdited}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[#f3d34a]">
                          Continue
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Stories */}
            <Card className="bg-[#112240] border-[#1d3557]">
              <CardHeader>
                <CardTitle className="text-white">Recommended Stories</CardTitle>
                <CardDescription className="text-[#8892b0]">
                  Stories you might like
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedStories.length === 0 ? (
                    <p className="text-[#8892b0] text-center py-4">
                      No recommendations found.
                    </p>
                  ) : (
                    recommendedStories.map((story) => (
                      <div key={story.id} className="group">
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <img
                            src={story.thumbnail}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-2 left-2 bg-[#0a192f]/80 px-2 py-1 rounded-full flex items-center gap-1">
                            {getTypeIcon(story.type)}
                            <span className="text-xs text-white capitalize">{story.type}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <h3 className="text-white font-medium">{story.title}</h3>
                          {story.author && (
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={"/placeholder.svg"} alt={story.author?.username || "Author"} />
                                <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xs">
                                  {(story.author?.username || "A")[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-[#8892b0]">{story.author?.username || "Unknown"}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
