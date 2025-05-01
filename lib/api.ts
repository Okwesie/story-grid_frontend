// Base URL for your API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

// Types for better type safety
export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  role?: string
}

export interface UserData {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
}

// Media related types
export interface MediaData {
  url: string
  type: string
  mediaId?: string
  metadata?: {
    publicId?: string
    format?: string
    size?: number
    width?: number
    height?: number
    resourceType?: string
  }
}

export interface UploadParams {
  data: {
    cloudName: string
    apiKey: string
    uploadParams: {
      timestamp: number
      folder: string
      public_id?: string
      signature: string
    }
    uploadUrl: string
  }
}

// Story related types
export interface StoryBlock {
  type: string
  content: string
  caption?: string
  mediaId?: string
}

export interface StoryData {
  title: string
  description?: string
  tags?: string[]
  coverImage?: MediaData
  blocks?: StoryBlock[]
  isDraft?: boolean
}

export interface Story {
  id: string
  title: string
  content?: string
  description?: string
  status: "draft" | "published" | "archived"
  category?: string
  tags?: string[]
  viewCount?: number
  readTime?: number
  isFeatured?: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  userId?: string
  author?: {
    id: string
    username: string
  }
  thumbnail?: string
  coverImage?: MediaData
  blocks?: StoryBlock[]
  type?: "visual" | "audio" | "video" | "interactive"
  views?: number
  likes?: number
  comments?: number
  timeAgo?: string
  lastEdited?: string
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
}

export interface ApiError extends Error {
  response?: {
    data?: {
      msg?: string
    }
  }
}

// Generic fetch function with error handling
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  // Get token from localStorage if available
  let token = null
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token")
  }

  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  }

  // If not uploading FormData, default Content-Type
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  console.log("fetchApi headers:", headers)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 204) {
      return { success: true }
    }

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.msg || "Something went wrong"
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Auth-related API functions
export const authApi = {
  register: async (userData: any) => {
    return fetchApi("/user/signUp", {
      method: "POST",
      body: JSON.stringify({ data: userData }),
    })
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await fetchApi("/user/login", {
      method: "POST",
      body: JSON.stringify({ data: credentials }),
    })
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token)
    }
    return response
  },

  getCurrentUser: async () => {
    return fetchApi("/auth/user")
  },

  logout: async () => {
    localStorage.removeItem("token")
    return fetchApi("/auth/logout", { method: "POST" })
  },
}

// User-related API functions
export const userApi = {
  getUserData: async () => {
    return fetchApi("/users/profile")
  },

  updateProfile: async (userData: any) => {
    return fetchApi("/users/profile", {
      method: "PUT",
      body: JSON.stringify({ data: userData }),
    })
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    return fetchApi("/users/changePassword", {
      method: "POST",
      body: JSON.stringify({ data: passwordData }),
    })
  },

  // New functions
  fetchUserProfile: async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("/auth/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.status === 200) {
        return {
          success: true,
          data: result.data,
          message: result.msg,
        }
      } else {
        return {
          success: false,
          data: null,
          message: result.msg || "Failed to fetch profile",
        }
      }
    } catch (error) {
      console.error("API Error:", error)
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "An error occurred",
      }
    }
  },

  updateUserProfile: async (updateData: any) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: updateData }),
      })

      const result = await response.json()

      if (result.status === 200) {
        return {
          success: true,
          data: result.data,
          message: result.msg,
        }
      } else {
        return {
          success: false,
          data: null,
          message: result.msg || "Failed to update profile",
        }
      }
    } catch (error) {
      console.error("API Error:", error)
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "An error occurred",
      }
    }
  },

  changeUserPassword: async (currentPassword: string, newPassword: string) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("/user/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            currentPassword,
            newPassword,
          },
        }),
      })

      const result = await response.json()

      if (result.status === 200) {
        return {
          success: true,
          data: result.data,
          message: result.msg,
        }
      } else {
        return {
          success: false,
          data: null,
          message: result.msg || "Failed to change password",
        }
      }
    } catch (error) {
      console.error("API Error:", error)
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "An error occurred",
      }
    }
  },

  logoutUser: async () => {
    try {
      const token = localStorage.getItem("token")

      if (token) {
        const response = await fetch("/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        // Clear token regardless of response
        localStorage.removeItem("token")

        const result = await response.json()

        return {
          success: true,
          message: result.msg || "Logged out successfully",
        }
      } else {
        // No token, just return success
        return {
          success: true,
          message: "Logged out successfully",
        }
      }
    } catch (error) {
      console.error("API Error:", error)
      // Still clear token even if API call fails
      localStorage.removeItem("token")

      return {
        success: true, // Consider logout successful even if API fails
        message: "Logged out successfully",
      }
    }
  },
}

// Stories-related API functions
export const storiesApi = {
  createStory: async (storyData: StoryData) => {
    return fetchApi("/story/createStory", {
      method: "POST",
      body: JSON.stringify({ data: storyData }),
    })
  },

  getAllStories: async (params: { status?: string; limit?: number; page?: number } = {}) => {
    return fetchApi("/story/getDashboardStories", {
      method: "POST",
      body: JSON.stringify({ data: params }),
    })
  },

  getDashboardStories: async () => {
    return fetchApi("/story/getDashboardStories", { method: "POST" })
  },

  getStoryById: async (id: string) => {
    return fetchApi("/story/getStory", {
      method: "POST",
      body: JSON.stringify({ data: { id } }),
    })
  },

  deleteStory: async (id: string) => {
    return fetchApi("/story/deleteStory", {
      method: "POST",
      body: JSON.stringify({ data: { id } }),
    })
  },

  likeStory: async (storyId: string) => {
    return fetchApi("/story/likeStory", {
      method: "POST",
      body: JSON.stringify({ data: { storyId } }),
    })
  },

  unlikeStory: async (storyId: string) => {
    return fetchApi("/story/unlikeStory", {
      method: "POST",
      body: JSON.stringify({ data: { storyId } }),
    })
  },

  getRecommendedStories: async () => {
    return fetchApi("/feed/getDiscover", {
      method: "POST",
    })
  },
}

// Comments-related API functions
export const commentsApi = {
  getStoryComments: async (storyId: string) => {
    return fetchApi("/story/getComments", {
      method: "POST",
      body: JSON.stringify({ data: { storyId } }),
    })
  },

  addComment: async (storyId: string, content: string) => {
    return fetchApi("/story/commentStory", {
      method: "POST",
      body: JSON.stringify({ data: { storyId, content } }),
    })
  },

  deleteComment: async (commentId: string) => {
    return fetchApi("/story/deleteComment", {
      method: "POST",
      body: JSON.stringify({ data: { commentId } }),
    })
  },
}

// Friends-related API functions
export const friendsApi = {
  sendFriendRequest: async (friendId: string) => {
    return fetchApi("/friend/request", {
      method: "POST",
      body: JSON.stringify({ data: { friendId } }),
    })
  },

  acceptFriendRequest: async (friendId: string) => {
    return fetchApi(`/friend/accept/${friendId}`, { method: "POST" })
  },

  getPendingRequests: async () => {
    return fetchApi("/friend/pending")
  },

  getFriends: async () => {
    return fetchApi("/friend/list")
  },

  rejectFriendRequest: async (friendId: string) => {
    return fetchApi(`/friend/reject/${friendId}`, { method: "DELETE" })
  },

  removeFriend: async (friendId: string) => {
    return fetchApi(`/friend/remove/${friendId}`, { method: "DELETE" })
  },
}

// Media-related API functions
export const mediaApi = {
  uploadMedia: async (formData: FormData) => {
    return fetchApi("/media/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set correct FormData headers
    })
  },

  getUploadParams: async (fileName: string, fileType: string) => {
    return fetchApi("/media/getUploadParams", {
      method: "POST",
      body: JSON.stringify({ data: { fileName, fileType } }),
    })
  },

  saveUploadedMedia: async (mediaInfo: any) => {
    return fetchApi("/media/saveUploadedMedia", {
      method: "POST",
      body: JSON.stringify({ data: mediaInfo }),
    })
  },

  deleteMedia: async (mediaId: string) => {
    return fetchApi("/media/delete", {
      method: "POST",
      body: JSON.stringify({ data: { mediaId } }),
    })
  },
}

// Feed-related API functions
export const feedApi = {
  getFriendsFeed: async (page = 1, limit = 10, sortBy = "createdAt", sortOrder = "DESC") => {
    return fetchApi("/feed/getFeed", {
      method: "POST",
      body: JSON.stringify({
        data: { page, limit, sortBy, sortOrder },
      }),
    })
  },

  getDiscoverFeed: async (page = 1, limit = 10) => {
    return fetchApi("/feed/getDiscover", {
      method: "POST",
      body: JSON.stringify({
        data: { page, limit },
      }),
    })
  },

  toggleLike: async (storyId: string) => {
    return fetchApi("/story/toggleLike", {
      method: "POST",
      body: JSON.stringify({
        data: { storyId },
      }),
    })
  },

  toggleBookmark: async (storyId: string) => {
    return fetchApi("/story/toggleBookmark", {
      method: "POST",
      body: JSON.stringify({
        data: { storyId },
      }),
    })
  },
}

// Admin-related API functions
export const adminApi = {
  getDashboard: async () => {
    return fetchApi("/admin/dashboard")
  },
  getUsers: async () => {
    return fetchApi("/admin/users")
  },
  blockUser: async (userId: string) => {
    return fetchApi(`/admin/blockUser/${userId}`, { method: "POST" })
  },
  unblockUser: async (userId: string) => {
    return fetchApi(`/admin/unblockUser/${userId}`, { method: "POST" })
  },
}

// Utility-related API functions
export const utilApi = {
  decrypt: async (data: any) => {
    return fetchApi("/util/decrypt", {
      method: "POST",
      body: JSON.stringify({ data }),
    })
  },
}

// Export a combined API object for convenience
export const api = {
  auth: authApi,
  stories: storiesApi,
  feed: feedApi,
  friends: friendsApi,
  media: mediaApi,
  admin: adminApi,
  util: utilApi,
}

export default api
