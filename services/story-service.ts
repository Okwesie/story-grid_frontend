import type { Story, Comment } from "@/types/story"
import { storiesApi, commentsApi } from "@/lib/api"

export async function getDrafts(): Promise<Story[]> {
  const response = await storiesApi.getAllStories({ status: "draft" })
  if (!response.success || !response.data) {
    throw new Error("Failed to fetch drafts")
  }
  return response.data
}

export async function getRecentStories(): Promise<Story[]> {
  const response = await storiesApi.getAllStories({ status: "published", limit: 10 })
  if (!response.success || !response.data) {
    throw new Error("Failed to fetch recent stories")
  }
  return response.data
}

export async function getFeedStories(): Promise<{
  friendStories: Story[]
  trendingStories: Story[]
  discoverStories: Story[]
}> {
  const [friendsResponse, discoverResponse] = await Promise.all([
    storiesApi.getAllStories({ status: "published", limit: 5 }),
    storiesApi.getRecommendedStories()
  ])

  if (!friendsResponse.success || !friendsResponse.data || !discoverResponse.success || !discoverResponse.data) {
    throw new Error("Failed to fetch feed")
  }

  return {
    friendStories: friendsResponse.data,
    trendingStories: [], // TODO: Implement trending stories when API is available
    discoverStories: discoverResponse.data
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
