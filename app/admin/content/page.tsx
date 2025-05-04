"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  RefreshCw,
  FileText,
  ImageIcon,
  Headphones,
  Play,
  Type,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSidebar } from "@/app/admin/components/admin-sidebar"

interface Story {
  id: string
  title: string
  type?: "visual" | "audio" | "video" | "interactive"
  status?: "published" | "draft" | "reported"
  createdAt: string
  author?: { id: string; username: string }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  status?: "active" | "reported"
  storyId?: string
  author?: { id: string; username: string }
}

const getTypeIcon = (type?: Story["type"]) => {
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
      return <FileText className="h-4 w-4" />
  }
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState("stories")
  const [stories, setStories] = useState<Story[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storySearch, setStorySearch] = useState("")
  const [commentSearch, setCommentSearch] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch dashboard data")
      const data = await response.json()
      setStories(data.data?.recentActivity?.stories || [])
      setComments(data.data?.recentActivity?.comments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStories = stories.filter(
    s =>
      s.title.toLowerCase().includes(storySearch.toLowerCase()) ||
      (s.author?.username?.toLowerCase() ?? "").includes(storySearch.toLowerCase())
  )

  const filteredComments = comments.filter(
    c =>
      c.content.toLowerCase().includes(commentSearch.toLowerCase()) ||
      (c.author?.username?.toLowerCase() ?? "").includes(commentSearch.toLowerCase())
  )

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-56 p-8">
        <Tabs defaultValue="stories" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-[#112240] w-full justify-start mb-6">
            <TabsTrigger value="stories" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]">
              Stories
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-[#0a192f] data-[state=active]:text-[#f3d34a]">
              Comments
            </TabsTrigger>
          </TabsList>
          <TabsContent value="stories">
            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Stories</CardTitle>
                    <CardDescription className="text-[#8892b0]">Latest stories on the platform</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                      <Input
                        placeholder="Search stories..."
                        className="pl-10 bg-[#1d3557] border-[#1d3557] text-white"
                        value={storySearch}
                        onChange={e => setStorySearch(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                      onClick={fetchDashboardData}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
                          <th className="pb-3 font-medium">Title</th>
                          <th className="pb-3 font-medium">Author</th>
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStories.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-[#8892b0]">
                              No stories found.
                            </td>
                          </tr>
                        ) : (
                          filteredStories.map(story => (
                            <tr key={story.id} className="border-b border-[#1d3557]">
                              <td className="py-4">{story.title}</td>
                              <td className="py-4">{story.author?.username || "Unknown"}</td>
                              <td className="py-4 flex items-center gap-1">{getTypeIcon(story.type)} {story.type}</td>
                              <td className="py-4">
                                <Badge>{story.status}</Badge>
                              </td>
                              <td className="py-4">{new Date(story.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="comments">
            <Card className="bg-[#112240] border-[#1d3557] text-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Comments</CardTitle>
                    <CardDescription className="text-[#8892b0]">Latest comments on the platform</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                      <Input
                        placeholder="Search comments..."
                        className="pl-10 bg-[#1d3557] border-[#1d3557] text-white"
                        value={commentSearch}
                        onChange={e => setCommentSearch(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                      onClick={fetchDashboardData}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
                          <th className="pb-3 font-medium">Comment</th>
                          <th className="pb-3 font-medium">Author</th>
                          <th className="pb-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComments.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-6 text-center text-[#8892b0]">
                              No comments found.
                            </td>
                          </tr>
                        ) : (
                          filteredComments.map(comment => (
                            <tr key={comment.id} className="border-b border-[#1d3557]">
                              <td className="py-4">{comment.content}</td>
                              <td className="py-4">{comment.author?.username || "Unknown"}</td>
                              <td className="py-4">{new Date(comment.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
