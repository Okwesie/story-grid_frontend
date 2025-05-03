"use client"

import { useState, useEffect } from "react"
import type { Story } from "@/types/story"
import StoryGrid from "./story-grid"
import { getRecentStories, likeStory, unlikeStory, addComment } from "@/services/story-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function RecentStoriesClient() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadStories() {
      try {
        const data = await getRecentStories()
        setStories(data)
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

      if (story.isLiked) {
        // Optimistically update UI
        setStories(stories.map((s) => (s.id === storyId ? { ...s, isLiked: false, likesCount: s.likesCount - 1 } : s)))
        await unlikeStory(storyId)
      } else {
        // Optimistically update UI
        setStories(stories.map((s) => (s.id === storyId ? { ...s, isLiked: true, likesCount: s.likesCount + 1 } : s)))
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
      const originalStories = await getRecentStories()
      setStories(originalStories)
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
              commentsCount: story.commentsCount + 1,
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
      <h1 className="text-2xl font-bold">Recent Stories</h1>
      <StoryGrid
        stories={stories}
        emptyMessage="No recent stories found."
        onLike={handleLike}
        onComment={handleComment}
      />
    </div>
  )
}
