// Base URL for your API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

// Import utility functions
import { setCookie, getCookie, deleteCookie } from "@/lib/utils"

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

// Token management functions with cookie fallback
function getAuthToken(): string | null {
  // Skip on server
  if (typeof window === "undefined") return null;
  
  // Try localStorage first
  const token = localStorage.getItem("token");
  if (token) return token;
  
  // Fallback to cookie
  return getCookie("auth_token");
}

function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  
  // Store in both localStorage and cookie for redundancy
  localStorage.setItem("token", token);
  setCookie("auth_token", token, 7); // 7 days
}

function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem("token");
  deleteCookie("auth_token");
}

// Check if we're on server side
const isServer = () => typeof window === "undefined"

// Cache to prevent multiple concurrent token refreshes
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

// Process the failed queue
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  
  failedQueue = []
}

// Generic fetch function with error handling and token refresh
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Skip token-related operations on server
  if (isServer()) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>)
    }

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
      console.error("API request failed on server:", error)
      throw error
    }
  }

  // Client-side code from here on
  const url = `${API_BASE_URL}${endpoint}`

  // Get token from localStorage if available
  let token = getAuthToken()

  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  }

  // If not uploading FormData, default Content-Type
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 204) {
      return { success: true }
    }

    // Special handling for 401 Unauthorized - potential token expiration
    if (response.status === 401 && token && !endpoint.includes("/auth/refresh")) {
      if (isRefreshing) {
        // If already refreshing, wait for new token
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newToken) => {
            headers.Authorization = `Bearer ${newToken}`
            return fetch(url, {
              ...options,
              headers,
            }).then(async (retryResponse) => {
              if (retryResponse.status === 204) {
                return { success: true }
              }
              return await retryResponse.json()
            })
          })
          .catch((err) => {
            console.error("Token refresh failed:", err)
            removeAuthToken()
            // Avoid page refresh within an API call to prevent hydration issues
            return { success: false, error: "Authentication failed" }
          })
      }

      // Start token refresh process
      isRefreshing = true

      try {
        // Here you would normally call a token refresh endpoint
        // For now, we'll just simulate a failed refresh and clear token
        removeAuthToken()
        
        // Reset the refreshing flag
        isRefreshing = false
        
        // Process any queued requests with an error
        processQueue(new Error("Token expired and refresh failed"))
        
        // Return a standardized error response
        return { 
          success: false, 
          data: null, 
          message: "Authentication session expired" 
        }
      } catch (refreshError) {
        isRefreshing = false
        processQueue(refreshError as Error)
        return { 
          success: false, 
          data: null, 
          message: "Authentication error" 
        }
      }
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
      setAuthToken(response.data.token)
    }
    return response
  },

  getCurrentUser: async () => {
    return fetchApi("/auth/user")
  },

  logout: async () => {
    removeAuthToken()
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
      const token = getAuthToken()

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
      const token = getAuthToken()

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
      const token = getAuthToken()

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
      const token = getAuthToken()

      if (token) {
        const response = await fetch("/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        // Clear token regardless of response
        removeAuthToken()

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
      removeAuthToken()

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
