"use client"

import { useState, useEffect } from "react"
import type { Story } from "@/types/story"
import StoryGrid from "./story-grid"
import { getDashboardStories, likeStory, unlikeStory, addComment } from "@/services/story-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RecentStoriesClient() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadStories() {
      try {
        const { recentPublished } = await getDashboardStories()
        setStories(recentPublished)
      } catch (error) {
        console.error("Failed to load recent stories:", error)
        toast({
          title: "Error",
          description: "Failed to load recent stories. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadStories()
  }, [toast])

  const handleLike = async (storyId: string) => {
    try {
      // Find the story and check if it's already liked
      const story = stories.find((s) => s.id === storyId)
      if (!story) return

      if (story.userLiked) {
        // Optimistically update UI
        setStories(stories.map((s) => (s.id === storyId ? { ...s, userLiked: false, likeCount: (s.likeCount || 0) - 1 } : s)))
        await unlikeStory(storyId)
      } else {
        // Optimistically update UI
        setStories(stories.map((s) => (s.id === storyId ? { ...s, userLiked: true, likeCount: (s.likeCount || 0) + 1 } : s)))
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
      const originalStories = await getDashboardStories()
      setStories(originalStories.recentPublished)
    }
  }

  const handleComment = async (storyId: string, comment: string) => {
    try {
      const newComment = await addComment(storyId, comment)

      // Update the stories state with the new comment
      setStories(
        stories.map((story) => {
          if (story.id === storyId) {
            return {
              ...story,
              comments: [...story.comments, newComment],
              commentCount: (story.commentCount || 0) + 1,
            }
          }
          return story
        }),
      )

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
      {/* Enhanced Header */}
      <header className="bg-[#0a192f] border-b border-[#1d3557] p-4 sticky top-0 z-10 mb-6">
        <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:text-[#f3d34a]">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-[#f3d34a] text-2xl font-bold">Recent Stories</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex mt-4 border-b border-[#1d3557]">
            <div className="text-[#f3d34a] border-b-2 border-[#f3d34a] px-4 py-2 font-medium">For You</div>
            
          </div>
        </div>
      </header>
      <StoryGrid
        stories={stories}
        emptyMessage="No recent stories found."
        onLike={handleLike}
        onComment={handleComment}
      />
    </div>
  )
}
