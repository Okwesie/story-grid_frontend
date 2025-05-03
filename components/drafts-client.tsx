"use client"

import { useState, useEffect } from "react"
import type { Story } from "@/types/story"
import { getDrafts, deleteDraft } from "@/services/story-service"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"

export default function DraftsClient() {
  const [drafts, setDrafts] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadDrafts() {
      try {
        const data = await getDrafts()
        setDrafts(data)
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
      setDrafts(drafts.filter((draft) => draft.id !== storyId))
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
      setDrafts(drafts.filter((draft) => draft.id !== storyId))
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
          <p className="text-gray-500 mb-4">You don't have any drafts yet.</p>
          <Link href="/create_story">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Story
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-card rounded-lg overflow-hidden border border-border">
              <div className="aspect-video relative overflow-hidden">
                {draft.coverImage ? (
                  <img
                    src={draft.coverImage.url || "/placeholder.svg"}
                    alt={draft.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No cover image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{draft.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{draft.description || "No description"}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(draft.id)}
                    disabled={deletingId === draft.id || publishingId === draft.id}
                  >
                    {deletingId === draft.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePublish(draft.id)}
                    disabled={deletingId === draft.id || publishingId === draft.id}
                  >
                    {publishingId === draft.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Publish
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
