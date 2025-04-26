// Base URL for your API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Types for better type safety
export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string
  createdAt: string
  updatedAt: string
}

export interface Story {
  id: string;
  title: string;
  content: string;
  type: "visual" | "audio" | "video" | "interactive";
  authorId: string;
  author?: User;
  thumbnail?: string;
  views?: number;
  likes?: number;
  comments?: number;
  timeAgo?: string;
  lastEdited?: string;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
}

export interface Comment {
  id: string
  content: string
  storyId: string
  authorId: string
  author?: User
  createdAt: string
  updatedAt: string
}

export interface Friend {
  id: string
  status: "pending" | "accepted" | "rejected"
  requesterId: string
  addresseeId: string
  requester?: User
  addressee?: User
  createdAt: string
  updatedAt: string
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  profileImage?: string;
  stories?: Story[];
  // Add other user-specific fields your API returns
}

// Generic fetch function with error handling
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  // Get token from localStorage if available
  let token = null
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token")
  }

  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 204 No Content responses
    if (response.status === 204) {
      return { success: true }
    }

    const data = await response.json()

    if (!response.ok) {
      // Format error message from the API
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

    // Store token in localStorage if available
    if (response.token) {
      localStorage.setItem("token", response.token)
    }

    return response
  },

  getCurrentUser: async () => {
    return fetchApi("/user/login")
  },

  logout: async () => {
    const response = await fetchApi("/auth/logout", {
      method: "POST",
    })

    // Remove token from localStorage
    localStorage.removeItem("token")

    return response
  },
}

// Stories-related API functions
export const storiesApi = {
  getAllStories: async (params: { 
    userId?: string; 
    status?: 'published' | 'draft';
    page?: number; 
    limit?: number 
  }) => {
    const queryParams = new URLSearchParams()
    if (params.userId) queryParams.append('userId', params.userId)
    if (params.status) queryParams.append('status', params.status)
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())

    return fetchApi(`/stories?${queryParams.toString()}`)
  },

  getRecommendedStories: async () => {
    return fetchApi('/stories/recommended')
  },

  getStoryById: async (id: string) => {
    return fetchApi(`/stories/${id}`)
  },

  createStory: async (storyData: { title: string; content: string }) => {
    return fetchApi("/stories", {
      method: "POST",
      body: JSON.stringify({ data: storyData }),
    })
  },

  updateStory: async (id: string, storyData: { title?: string; content?: string }) => {
    return fetchApi(`/stories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data: storyData }),
    })
  },

  deleteStory: async (id: string) => {
    return fetchApi(`/stories/${id}`, {
      method: "DELETE",
    })
  },

  likeStory: async (storyId: string) => {
    return fetchApi(`/stories/${storyId}/like`, {
      method: "POST",
    })
  },

  unlikeStory: async (storyId: string) => {
    return fetchApi(`/stories/${storyId}/like`, {
      method: "DELETE",
    })
  },
}

// Comments-related API functions
export const commentsApi = {
  getStoryComments: async (storyId: string) => {
    return fetchApi(`/stories/${storyId}/comments`)
  },

  addComment: async (storyId: string, content: string) => {
    return fetchApi(`/stories/${storyId}/comments`, {
      method: "POST",
      body: JSON.stringify({ data: { content } }),
    })
  },

  updateComment: async (commentId: string, content: string) => {
    return fetchApi(`/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ data: { content } }),
    })
  },

  deleteComment: async (commentId: string) => {
    return fetchApi(`/comments/${commentId}`, {
      method: "DELETE",
    })
  },
}

// Friends-related API functions
export const friendsApi = {
  getFriends: async () => {
    return fetchApi("/friends")
  },

  sendFriendRequest: async (friendId: string) => {
    return fetchApi(`/friends/${friendId}`, {
      method: "POST",
    })
  },

  respondToFriendRequest: async (friendId: string, status: "accepted" | "rejected") => {
    return fetchApi(`/friends/${friendId}`, {
      method: "PUT",
      body: JSON.stringify({ data: { status } }),
    })
  },

  removeFriend: async (friendId: string) => {
    return fetchApi(`/friends/${friendId}`, {
      method: "DELETE",
    })
  },
}

export const userApi = {
  getUserData: async (): Promise<UserData> => {
    // Remove the extra "api" from the path since it's already in API_BASE_URL
    return fetchApi("/auth/user", {
      method: "GET",
    })
  }
}

// Add this to your existing api functions
export const dashboardApi = {
  getDashboardData: async () => {
    return fetchApi("/api/admin/dashboard", {
      method: "GET",
    })
  }
}

// Export a combined API object for convenience
export const api = {
  auth: authApi,
  stories: storiesApi,
  comments: commentsApi,
  friends: friendsApi,
  dashboard: dashboardApi,
  user: userApi
}

export default api
