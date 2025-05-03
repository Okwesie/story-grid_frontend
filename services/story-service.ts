import type { Story, Comment } from "@/types/story"
import { storiesApi, commentsApi } from "@/lib/api"
import { api } from "@/lib/api"

export async function getDrafts(): Promise<Story[]> {
  const response = await storiesApi.getAllStories({ status: "draft" })
  if (!response.success || !response.data) {
    throw new Error("Failed to fetch drafts")
  }
  return response.data
}

export async function getRecentStories(): Promise<Story[]> {
  const response = await storiesApi.getAllStories({ status: "published", limit: 10 })
  // If response.data is { stories: [...] }
  if (response.data && Array.isArray(response.data.stories)) {
    return response.data.stories
  }
  // If response.data is { recentPublished: [...] }
  if (response.data && Array.isArray(response.data.recentPublished)) {
    return response.data.recentPublished
  }
  // If response.data is just an array
  if (Array.isArray(response.data)) {
    return response.data
  }
  return []
}

export async function getFeedStories() {
  // Friends feed
  const feedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feed/getFeed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(typeof window !== "undefined" && localStorage.getItem("token")
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
        : {}),
    },
    body: JSON.stringify({ data: { page: 1, limit: 10 } }),
  })
  const feedJson = await feedRes.json()

  // Discover feed
  const discoverRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feed/getDiscover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(typeof window !== "undefined" && localStorage.getItem("token")
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
        : {}),
    },
    body: JSON.stringify({ data: { page: 1, limit: 10 } }),
  })
  const discoverJson = await discoverRes.json()

  return {
    friendStories: Array.isArray(feedJson.data?.stories) ? feedJson.data.stories : [],
    trendingStories: [], // Add if you have a trending endpoint
    discoverStories: Array.isArray(discoverJson.data?.stories) ? discoverJson.data.stories : [],
  }
}

export async function likeStory(storyId: string): Promise<void> {
  const response = await storiesApi.likeStory(storyId)
  if (!response.success) {
    throw new Error("Failed to like story")
  }
}

export async function unlikeStory(storyId: string): Promise<void> {
  const response = await storiesApi.unlikeStory(storyId)
  if (!response.success) {
    throw new Error("Failed to unlike story")
  }
}

export async function addComment(storyId: string, content: string): Promise<Comment> {
  const response = await commentsApi.addComment(storyId, content)
  if (!response.success || !response.data) {
    throw new Error("Failed to add comment")
  }
  return response.data
}

export async function getStoryById(storyId: string): Promise<Story> {
  const response = await storiesApi.getStoryById(storyId)
  if (!response.success || !response.data) {
    throw new Error("Failed to fetch story")
  }
  return response.data
}

/** export async function publishDraft(storyId: string): Promise<Story> {
  const response = await storiesApi.updateStory(storyId, { status: "published" })
  if (!response.success || !response.data) {
    throw new Error("Failed to publish draft")
  }
  return response.data
}
*/
export async function deleteDraft(storyId: string): Promise<void> {
  const response = await storiesApi.deleteStory(storyId)
  if (!response.success) {
    throw new Error("Failed to delete draft")
  }
}
