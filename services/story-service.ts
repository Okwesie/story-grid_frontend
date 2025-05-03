import type { Story, Comment } from "@/types/story"

const API_URL = "/api"

export async function getDrafts(): Promise<Story[]> {
  const response = await fetch(`${API_URL}/stories/drafts`)
  if (!response.ok) {
    throw new Error("Failed to fetch drafts")
  }
  return response.json()
}

export async function getRecentStories(): Promise<Story[]> {
  const response = await fetch(`${API_URL}/stories/recent`)
  if (!response.ok) {
    throw new Error("Failed to fetch recent stories")
  }
  return response.json()
}

export async function getFeedStories(): Promise<{
  friendStories: Story[]
  trendingStories: Story[]
  discoverStories: Story[]
}> {
  const response = await fetch(`${API_URL}/feed`)
  if (!response.ok) {
    throw new Error("Failed to fetch feed")
  }
  return response.json()
}

export async function likeStory(storyId: string): Promise<void> {
  const response = await fetch(`${API_URL}/stories/${storyId}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to like story")
  }
}

export async function unlikeStory(storyId: string): Promise<void> {
  const response = await fetch(`${API_URL}/stories/${storyId}/unlike`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to unlike story")
  }
}

export async function addComment(storyId: string, content: string): Promise<Comment> {
  const response = await fetch(`${API_URL}/stories/${storyId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    throw new Error("Failed to add comment")
  }

  return response.json()
}

export async function getStoryById(storyId: string): Promise<Story> {
  const response = await fetch(`${API_URL}/stories/${storyId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch story")
  }
  return response.json()
}

export async function publishDraft(storyId: string): Promise<Story> {
  const response = await fetch(`${API_URL}/stories/${storyId}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to publish draft")
  }

  return response.json()
}

export async function deleteDraft(storyId: string): Promise<void> {
  const response = await fetch(`${API_URL}/stories/${storyId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete draft")
  }
}
