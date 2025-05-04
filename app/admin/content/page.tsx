"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Trash2,
  MoreHorizontal,
  Filter,
  RefreshCw,
  Eye,
  Heart,
  MessageSquare,
  FileText,
  ImageIcon,
  Headphones,
  Play,
  Type,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmationDialog } from "../components/confirmation-dialog"

interface Story {
  id: string
  title: string
  type: "visual" | "audio" | "video" | "interactive"
  status: "published" | "draft" | "reported"
  createdAt: string
  publishedAt?: string
  views: number
  likes: number
  comments: number
  thumbnail?: string
  author: {
    id: string
    username: string
    profileImage?: string
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  status: "active" | "reported"
  storyId: string
  storyTitle: string
  author: {
    id: string
    username: string
    profileImage?: string
  }
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
      return <FileText className="h-4 w-4" />
  }
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<string>("stories")
  const [stories, setStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [isLoadingStories, setIsLoadingStories] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [storyError, setStoryError] = useState<string | null>(null)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [storySearchQuery, setStorySearchQuery] = useState("")
  const [commentSearchQuery, setCommentSearchQuery] = useState("")
  const [storyStatusFilter, setStoryStatusFilter] = useState<"all" | "published" | "draft" | "reported">("all")
  const [commentStatusFilter, setCommentStatusFilter] = useState<"all" | "active" | "reported">("all")

  useEffect(() => {
    if (activeTab === "stories") {
      fetchStories()
    } else if (activeTab === "comments") {
      fetchComments()
    }
  }, [activeTab])

  useEffect(() => {
    // Filter stories based on search query and status filter
    let result = stories

    if (storySearchQuery) {
      const query = storySearchQuery.toLowerCase()
      result = result.filter(
        (story) => story.title.toLowerCase().includes(query) || story.author.username.toLowerCase().includes(query),
      )
    }

    if (storyStatusFilter !== "all") {
      result = result.filter((story) => story.status === storyStatusFilter)
    }

    setFilteredStories(result)
  }, [stories, storySearchQuery, storyStatusFilter])

  useEffect(() => {
    // Filter comments based on search query and status filter
    let result = comments

    if (commentSearchQuery) {
      const query = commentSearchQuery.toLowerCase()
      result = result.filter(
        (comment) =>
          comment.content.toLowerCase().includes(query) ||
          comment.author.username.toLowerCase().includes(query) ||
          comment.storyTitle.toLowerCase().includes(query),
      )
    }

    if (commentStatusFilter !== "all") {
      result = result.filter((comment) => comment.status === commentStatusFilter)
    }

    setFilteredComments(result)
  }, [comments, commentSearchQuery, commentStatusFilter])

  const fetchStories = async () => {
    setIsLoadingStories(true)
    setStoryError(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/stories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stories")
      }

      const data = await response.json()
      setStories(data.data)
      setFilteredStories(data.data)
    } catch (err) {
      console.error("Error fetching stories:", err)
      setStoryError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoadingStories(false)
    }
  }

  const fetchComments = async () => {
    setIsLoadingComments(true)
    setCommentError(null)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/comments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      setComments(data.data)
      setFilteredComments(data.data)
    } catch (err) {
      console.error("Error fetching comments:", err)
      setCommentError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoadingComments(false)
    }
  }

  const deleteStory = async (storyId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/deleteStory/${storyId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete story")
      }

      // Remove story from the local state
      setStories((prevStories) => prevStories.filter((story) => story.id !== storyId))
    } catch (err) {
      console.error("Error deleting story:", err)
      throw err
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/deleteComment/${commentId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete comment")
      }

      // Remove comment from the local state
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId))
    } catch (err) {
      console.error("Error deleting comment:", err)
      throw err
    }
  }

  const renderStoriesContent = () => {
    if (isLoadingStories) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
        </div>
      )
    }

    if (storyError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg max-w-md text-center">
            <h3 className="text-xl font-bold mb-2">Error Loading Stories</h3>
            <p>{storyError}</p>
            <button
              className="mt-4 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 px-4 py-2 rounded-md"
              onClick={() => fetchStories()}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
              <th className="pb-3 font-medium">Story</th>
              <th className="pb-3 font-medium">Author</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Published</th>
              <th className="pb-3 font-medium">Engagement</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStories.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-[#8892b0]">
                  {storySearchQuery || storyStatusFilter !== "all"
                    ? "No stories match your search criteria"
                    : "No stories found in the system"}
                </td>
              </tr>
            ) : (
              filteredStories.map((story) => (
                <tr key={story.id} className="border-b border-[#1d3557]">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 rounded-md overflow-hidden bg-[#1d3557] flex-shrink-0">
                        <img
                          src={story.thumbnail || "/placeholder.svg?height=48&width=64"}
                          alt={story.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="font-medium truncate max-w-[200px]">{story.title}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={story.author.profileImage || "/placeholder.svg?height=32&width=32"}
                          alt={story.author.username}
                        />
                        <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                          {story.author.username ? story.author.username[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{story.author.username}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(story.type)}
                      <span className="capitalize">{story.type}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge
                      className={
                        story.status === "published"
                          ? "bg-green-500/20 text-green-500"
                          : story.status === "draft"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-red-500/20 text-red-500"
                      }
                    >
                      {story.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-[#8892b0]">
                    {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : "Not published"}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3 text-xs text-[#8892b0]">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{story.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{story.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{story.comments}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <ConfirmationDialog
                        title="Delete Story"
                        description={`Are you sure you want to delete "${story.title}"? This action cannot be undone.`}
                        actionLabel="Delete Story"
                        onConfirm={() => deleteStory(story.id)}
                        variant="destructive"
                        trigger={
                          <Button variant="outline" size="sm" className="border-[#1d3557] text-white hover:bg-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => (window.location.href = `/admin/content/stories/${story.id}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => (window.location.href = `/admin/content/stories/${story.id}/comments`)}
                          >
                            View Comments
                          </DropdownMenuItem>
                          {story.status === "reported" && (
                            <DropdownMenuItem
                              className="hover:bg-[#1d3557] cursor-pointer"
                              onClick={() => (window.location.href = `/admin/content/stories/${story.id}/reports`)}
                            >
                              View Reports
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }

  const renderCommentsContent = () => {
    if (isLoadingComments) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f3d34a]"></div>
        </div>
      )
    }

    if (commentError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg max-w-md text-center">
            <h3 className="text-xl font-bold mb-2">Error Loading Comments</h3>
            <p>{commentError}</p>
            <button
              className="mt-4 bg-[#f3d34a] text-[#0a192f] hover:bg-[#f3d34a]/90 px-4 py-2 rounded-md"
              onClick={() => fetchComments()}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[#8892b0] border-b border-[#1d3557]">
              <th className="pb-3 font-medium">Comment</th>
              <th className="pb-3 font-medium">Author</th>
              <th className="pb-3 font-medium">Story</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-[#8892b0]">
                  {commentSearchQuery || commentStatusFilter !== "all"
                    ? "No comments match your search criteria"
                    : "No comments found in the system"}
                </td>
              </tr>
            ) : (
              filteredComments.map((comment) => (
                <tr key={comment.id} className="border-b border-[#1d3557]">
                  <td className="py-4">
                    <div className="max-w-[300px] truncate">{comment.content}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.author.profileImage || "/placeholder.svg?height=32&width=32"}
                          alt={comment.author.username}
                        />
                        <AvatarFallback className="bg-[#1d3557] text-[#f3d34a]">
                          {comment.author.username ? comment.author.username[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{comment.author.username}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="max-w-[200px] truncate">{comment.storyTitle}</div>
                  </td>
                  <td className="py-4">
                    <Badge
                      className={
                        comment.status === "active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      }
                    >
                      {comment.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-[#8892b0]">{new Date(comment.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <ConfirmationDialog
                        title="Delete Comment"
                        description="Are you sure you want to delete this comment? This action cannot be undone."
                        actionLabel="Delete Comment"
                        onConfirm={() => deleteComment(comment.id)}
                        variant="destructive"
                        trigger={
                          <Button variant="outline" size="sm" className="border-[#1d3557] text-white hover:bg-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => (window.location.href = `/admin/content/comments/${comment.id}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-[#1d3557] cursor-pointer"
                            onClick={() => (window.location.href = `/admin/content/stories/${comment.storyId}`)}
                          >
                            View Story
                          </DropdownMenuItem>
                          {comment.status === "reported" && (
                            <DropdownMenuItem
                              className="hover:bg-[#1d3557] cursor-pointer"
                              onClick={() => (window.location.href = `/admin/content/comments/${comment.id}/reports`)}
                            >
                              View Reports
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Management</h1>
          <p className="text-[#8892b0]">Manage and moderate platform content</p>
        </div>
      </div>

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
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Stories</CardTitle>
                  <CardDescription className="text-[#8892b0]">Manage all stories on the platform</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                    <Input
                      placeholder="Search stories..."
                      className="pl-10 bg-[#1d3557] border-[#1d3557] text-white w-full sm:w-64"
                      value={storySearchQuery}
                      onChange={(e) => setStorySearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-[#1d3557] text-white hover:bg-[#1d3557]">
                        <Filter className="h-4 w-4 mr-2" />
                        {storyStatusFilter === "all"
                          ? "All Stories"
                          : storyStatusFilter === "published"
                            ? "Published"
                            : storyStatusFilter === "draft"
                              ? "Drafts"
                              : "Reported"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                      <DropdownMenuItem
                        className="hover:bg-[#1d3557] cursor-pointer"
                        onClick={() => setStoryStatusFilter("all")}
                      >
                        All Stories
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:bg-[#1d3557] cursor-pointer"
                        onClick={() => setStoryStatusFilter("published")}
                      >
                        Published
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:bg-[#1d3557] cursor-pointer"
                        onClick={() => setStoryStatusFilter("draft")}
                      >
                        Drafts
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:bg-[#1d3557] cursor-pointer"
                        onClick={() => setStoryStatusFilter("reported")}
                      >
                        Reported
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                    onClick={fetchStories}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>{renderStoriesContent()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card className="bg-[#112240] border-[#1d3557] text-white">
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Comments</CardTitle>
                  <CardDescription className="text-[#8892b0]">Manage all comments on the platform</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8892b0]" />
                    <Input
                      placeholder="Search comments..."
                      className="pl-10 bg-[#1d3557] border-[#1d3557] text-white w-full sm:w-64"
                      value={commentSearchQuery}
                      onChange={(e) => setCommentSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-[#1d3557] text-white hover:bg-[#1d3557]">
                        <Filter className="h-4 w-4 mr-2" />
                        {commentStatusFilter === "all"
                          ? "All Comments"
                          : commentStatusFilter === "active"
                            ? "Active"
                            : "Reported"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#112240] border-[#1d3557] text-white">
                      <DropdownMenuItem
                        className="hover:bg-[#1d3557] cursor-pointer"
                        onClick={() => setCommentStatusFilter("all")}
                      >
                        All Comments
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:bg-[#1d3557] cursor-pointer"
                        onClick={() => setCommentStatusFilter("active")}
                      >
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:bg-[#1d3557] cursor-pointer"
                        onClick={() => setCommentStatusFilter("reported")}
                      >
                        Reported
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    className="border-[#1d3557] text-white hover:bg-[#1d3557]"
                    onClick={fetchComments}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>{renderCommentsContent()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
