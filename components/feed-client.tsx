"use client"

import { useState, useEffect } from "react"
import type { Story } from "@/types/story"
import StoryGrid from "./story-grid"
import { getFeedStories, likeStory, unlikeStory, addComment } from "@/services/story-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
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
      if (story.isLiked) {
        setFeedData({
          ...feedData,
          [storySection]: feedData[storySection].map((s) =>
            s.id === storyId ? { ...s, isLiked: false, likesCount: s.likesCount - 1 } : s,
          ),
        })
        await unlikeStory(storyId)
      } else {
        setFeedData({
          ...feedData,
          [storySection]: feedData[storySection].map((s) =>
            s.id === storyId ? { ...s, isLiked: true, likesCount: s.likesCount + 1 } : s,
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
          updatedFeedData[section] = [...updatedFeedData[section]]
          updatedFeedData[section][storyIndex] = {
            ...updatedFeedData[section][storyIndex],
            comments: [...updatedFeedData[section][storyIndex].comments, newComment],
            commentsCount: updatedFeedData[section][storyIndex].commentsCount + 1,
          }
          break
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
      <h1 className="text-2xl font-bold">Feed</h1>

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
