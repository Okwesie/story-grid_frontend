"use client"

import { useState } from "react"
import Link from "next/link"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Story {
  id: number;
  title: string;
  type: "visual" | "audio" | "video" | "interactive";
  thumbnail?: string;
  views?: number;
  likes?: number;
  comments?: number;
  timeAgo?: string;
  lastEdited?: string;
  author?: string;
  authorAvatar?: string;
}

interface Notification {
  id: number;
  type: "like" | "comment" | "follow";
  user: string;
  content: string;
  time: string;
  avatar: string;
  read: boolean;
}

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
  const [activeTab, setActiveTab] = useState<string>("overview")

  // Sample data for dashboard
  const recentStories: Story[] = [
    {
      id: 1,
      title: "The Silent Forest",
      type: "visual",
      thumbnail: "/placeholder.svg?height=80&width=120",
      views: 342,
      likes: 56,
      comments: 12,
      timeAgo: "2 days ago",
    },
    {
      id: 2,
      title: "Urban Soundscapes",
      type: "audio",
      thumbnail: "/placeholder.svg?height=80&width=120",
      views: 189,
      likes: 34,
      comments: 8,
      timeAgo: "1 week ago",
    },
    {
      id: 3,
      title: "Digital Nomads",
      type: "video",
      thumbnail: "/placeholder.svg?height=80&width=120",
      views: 567,
      likes: 98,
      comments: 24,
      timeAgo: "2 weeks ago",
    },
  ]

  const draftStories: Story[] = [
    {
      id: 4,
      title: "Future Cities",
      type: "visual",
      lastEdited: "Yesterday",
    },
    {
      id: 5,
      title: "Ocean Depths",
      type: "interactive",
      lastEdited: "3 days ago",
    },
  ]

  const recommendedStories: Story[] = [
    {
      id: 6,
      title: "Mountain Expeditions",
      author: "Alex Rivera",
      type: "visual",
      thumbnail: "/placeholder.svg?height=120&width=200",
      authorAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 7,
      title: "Jazz in the City",
      author: "Maria Chen",
      type: "audio",
      thumbnail: "/placeholder.svg?height=120&width=200",
      authorAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 8,
      title: "Tokyo Nights",
      author: "James Wilson",
      type: "video",
      thumbnail: "/placeholder.svg?height=120&width=200",
      authorAvatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const notifications: Notification[] = [
    {
      id: 1,
      type: "like",
      user: "Alex Rivera",
      content: "liked your story 'The Silent Forest'",
      time: "2 hours ago",
      avatar: "/placeholder.svg?height=32&width=32",
      read: false,
    },
    {
      id: 2,
      type: "comment",
      user: "Maria Chen",
      content: "commented on your story 'Urban Soundscapes'",
      time: "1 day ago",
      avatar: "/placeholder.svg?height=32&width=32",
      read: true,
    },
    {
      id: 3,
      type: "follow",
      user: "James Wilson",
      content: "started following you",
      time: "3 days ago",
      avatar: "/placeholder.svg?height=32&width=32",
      read: true,
    },
  ]

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
            <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a] relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
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
            <h2 className="text-2xl font-bold text-white">Welcome back, Jane</h2>
            <p className="text-[#8892b0]">Here's what's happening with your stories</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link href="/create-story">
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

        {/* Dashboard Tabs */}
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
                  {recentStories.map((story) => (
                    <div key={story.id} className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <img
                          src={story.thumbnail}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#0a192f]/80 px-2 py-1 rounded-full flex items-center gap-1">
                          {getTypeIcon(story.type)}
                          <span className="text-xs text-white capitalize">{story.type}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{story.title}</h3>
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
                  ))}
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
                  {draftStories.map((story) => (
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
                  ))}
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
                  {recommendedStories.map((story) => (
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
                              <AvatarImage src={story.authorAvatar} alt={story.author} />
                              <AvatarFallback className="bg-[#1d3557] text-[#f3d34a] text-xs">
                                {story.author.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-[#8892b0]">{story.author}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ... rest of the tabs content ... */}
        </Tabs>
      </main>
    </div>
  )
}
