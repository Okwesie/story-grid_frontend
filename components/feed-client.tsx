"use client"

import { useState, useEffect } from "react"
import type { Story } from "@/types/story"
import StoryGrid from "./story-grid"
import { getFeedStories, likeStory, unlikeStory, addComment } from "@/services/story-service"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Loader2, Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FeedClient() {
  const [feedData, setFeedData] = useState<{
    friendStories: Story[]
    trendingStories: Story[]
    discoverStories: Story[]
  }>({
    friendStories: [],
    trendingStories: [],
    discoverStories: [],
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadFeed() {
      try {
        const data = await getFeedStories()
        setFeedData(data)
      } catch (error) {
        console.error("Failed to load feed:", error)
        toast({
          title: "Error",
          description: "Failed to load feed. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadFeed()
  }, [toast])

  const handleLike = async (storyId: string) => {
    try {
      // Find the story in any of the feed sections
      let storySection: "friendStories" | "trendingStories" | "discoverStories" | null = null
      let story: Story | undefined

      for (const section of ["friendStories", "trendingStories", "discoverStories"] as const) {
        story = feedData[section].find((s) => s.id === storyId)
        if (story) {
          storySection = section
          break
        }
      }

      if (!story || !storySection) return

      // Optimistically update UI
      if (story.userLiked) {
        setFeedData({
          ...feedData,
          [storySection]: feedData[storySection].map((s) =>
            s.id === storyId ? { ...s, userLiked: false, likeCount: (s.likeCount || 0) - 1 } : s,
          ),
        })
        await unlikeStory(storyId)
      } else {
        setFeedData({
          ...feedData,
          [storySection]: feedData[storySection].map((s) =>
            s.id === storyId ? { ...s, userLiked: true, likeCount: (s.likeCount || 0) + 1 } : s,
          ),
        })
        await likeStory(storyId)
      }
    } catch (error) {
      console.error("Failed to update like:", error)
      toast({
        title: "Error",
        description: "Failed to update like. Please try again later.",
        variant: "destructive",
      })
      // Revert optimistic update on error
      const originalFeed = await getFeedStories()
      setFeedData(originalFeed)
    }
  }

  const handleComment = async (storyId: string, comment: string) => {
    try {
      const newComment = await addComment(storyId, comment)

      // Update the stories state with the new comment in the appropriate section
      const updatedFeedData = { ...feedData }

      for (const section of ["friendStories", "trendingStories", "discoverStories"] as const) {
        const storyIndex = updatedFeedData[section].findIndex((s) => s.id === storyId)

        if (storyIndex !== -1) {
          const story = updatedFeedData[section][storyIndex]
          if (story) {
            updatedFeedData[section] = [...updatedFeedData[section]]
            updatedFeedData[section][storyIndex] = {
              ...story,
              comments: [...story.comments, newComment],
              commentCount: (story.commentCount || 0) + 1,
            }
            break
          }
        }
      }

      setFeedData(updatedFeedData)

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again later.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
            <Link href="/feed">
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

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <StoryGrid
            stories={feedData.friendStories}
            emptyMessage="No stories from friends yet. Follow more users to see their stories here."
            onLike={handleLike}
            onComment={handleComment}
          />
        </TabsContent>

        <TabsContent value="trending">
          <StoryGrid
            stories={feedData.trendingStories}
            emptyMessage="No trending stories available right now."
            onLike={handleLike}
            onComment={handleComment}
          />
        </TabsContent>

        <TabsContent value="discover">
          <StoryGrid
            stories={feedData.discoverStories}
            emptyMessage="No discover stories available right now."
            onLike={handleLike}
            onComment={handleComment}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
