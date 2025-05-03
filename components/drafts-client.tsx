"use client"

import { useState, useEffect } from "react"
import type { Story } from "@/types/story"
import { getDashboardStories, deleteDraft, publishDraft } from "@/services/story-service"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function DraftsClient() {
  const [drafts, setDrafts] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadDrafts() {
      setLoading(true)
      try {
        const { recentDrafts } = await getDashboardStories()
        setDrafts(recentDrafts)
      } catch (error) {
        console.error("Failed to load drafts:", error)
        toast({
          title: "Error",
          description: "Failed to load drafts. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadDrafts()
  }, [toast])

  const handlePublish = async (storyId: string) => {
    setPublishingId(storyId)
    try {
      await publishDraft(storyId)
      setDrafts((prev) => prev.filter((draft) => draft.id !== storyId))
      toast({
        title: "Success",
        description: "Your story has been published!",
      })
    } catch (error) {
      console.error("Failed to publish draft:", error)
      toast({
        title: "Error",
        description: "Failed to publish draft. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setPublishingId(null)
    }
  }

  const handleDelete = async (storyId: string) => {
    setDeletingId(storyId)
    try {
      await deleteDraft(storyId)
      setDrafts((prev) => prev.filter((draft) => draft.id !== storyId))
      toast({
        title: "Success",
        description: "Draft has been deleted.",
      })
    } catch (error) {
      console.error("Failed to delete draft:", error)
      toast({
        title: "Error",
        description: "Failed to delete draft. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Drafts</h1>
        <Link href="/create_story">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Story
          </Button>
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/50 rounded-lg">
          <FileText className="h-10 w-10 mb-2 text-muted-foreground opacity-50" />
          <p className="text-gray-500 mb-4">You don't have any drafts yet.</p>
          <Link href="/create_story">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Story
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-center gap-3 p-3 rounded-md bg-[#1d3557] hover:bg-[#1d3557]/80 transition-colors cursor-pointer"
            >
              <div className="h-8 w-8 rounded-md bg-[#0a192f] flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#f3d34a]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{draft.title || "Untitled Draft"}</h4>
                <p className="text-xs text-[#8892b0]">Last edited {draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : "recently"}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(draft.id)}
                disabled={deletingId === draft.id || publishingId === draft.id}
              >
                {deletingId === draft.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Delete
              </Button>
              <Button
                size="sm"
                onClick={() => handlePublish(draft.id)}
                disabled={deletingId === draft.id || publishingId === draft.id}
              >
                {publishingId === draft.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Publish
              </Button>
              <ChevronRight className="h-4 w-4 text-[#8892b0]" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
