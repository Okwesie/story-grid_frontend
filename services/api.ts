import type { Story, PaginatedResponse } from "@/types/story"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

interface ApiResponse<T> {
  status: number
  msg: string
  data: T
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("token")

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.msg || "Something went wrong")
  }

  return data
}

export const storyApi = {
  getDrafts: async (page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Story>>> => {
    return request<PaginatedResponse<Story>>("/story/getStories", {
      method: "POST",
      body: JSON.stringify({
        data: {
          filters: {
            status: "draft",
          },
          page,
          limit,
        },
      }),
    })
  },

  getRecentStories: async (
    filters: Record<string, any> = {},
    page = 1,
    limit = 10,
  ): Promise<ApiResponse<PaginatedResponse<Story>>> => {
    return request<PaginatedResponse<Story>>("/story/getRecentStories", {
      method: "POST",
      body: JSON.stringify({
        data: {
          filters,
          page,
          limit,
        },
      }),
    })
  },

  getFriendsFeed: async (
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "DESC",
  ): Promise<ApiResponse<PaginatedResponse<Story>>> => {
    return request<PaginatedResponse<Story>>("/feed/getFeed", {
      method: "POST",
      body: JSON.stringify({
        data: {
          page,
          limit,
          sortBy,
          sortOrder,
        },
      }),
    })
  },

  getDiscoverFeed: async (page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Story>>> => {
    return request<PaginatedResponse<Story>>("/feed/getDiscover", {
      method: "POST",
      body: JSON.stringify({
        data: {
          page,
          limit,
        },
      }),
    })
  },

  likeStory: async (storyId: string): Promise<ApiResponse<any>> => {
    return request<any>("/story/likeStory", {
      method: "POST",
      body: JSON.stringify({
        data: { storyId },
      }),
    })
  },

  unlikeStory: async (storyId: string): Promise<ApiResponse<any>> => {
    return request<any>("/story/unlikeStory", {
      method: "POST",
      body: JSON.stringify({
        data: { storyId },
      }),
    })
  },

  addComment: async (storyId: string, content: string, parentId?: string): Promise<ApiResponse<any>> => {
    return request<any>("/story/commentStory", {
      method: "POST",
      body: JSON.stringify({
        data: { storyId, content, parentId },
      }),
    })
  },

  getStoryComments: async (storyId: string, page = 1, limit = 10): Promise<ApiResponse<any>> => {
    return request<any>("/story/getComments", {
      method: "POST",
      body: JSON.stringify({
        data: { storyId, page, limit },
      }),
    })
  },
}
