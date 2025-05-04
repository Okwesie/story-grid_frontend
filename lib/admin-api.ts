import { fetchApi } from "./api"

// Types for admin dashboard
export interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  totalStories: number
  publishedStories: number
  draftStories: number
  totalComments: number
  totalLikes: number
  newUsersToday: number
  newStoriesThisWeek: number
}

export interface UserListItem {
  id: string
  username: string
  email: string
  role: string
  status: string
  createdAt: string
  lastActive?: string
  storiesCount?: number
}

export interface ContentListItem {
  id: string
  title: string
  author: {
    id: string
    username: string
  }
  status: string
  publishedAt?: string
  createdAt: string
  type: string
  views: number
  likes: number
  comments: number
}

export interface MessageListItem {
  id: string
  sender: {
    id: string
    username: string
  }
  recipient: {
    id: string
    username: string
  }
  subject: string
  content: string
  status: "read" | "unread"
  createdAt: string
}

// Admin API functions
export const adminApi = {
  // Dashboard metrics
  getDashboardMetrics: async () => {
    try {
      return await fetchApi("/admin/dashboard")
    } catch (error) {
      console.error("Failed to fetch dashboard metrics:", error)
      throw new Error("Failed to fetch dashboard metrics")
    }
  },

  // User management
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    try {
      return await fetchApi("/admin/users", {
        method: "POST",
        body: JSON.stringify({ data: { page, limit, filters } }),
      })
    } catch (error) {
      console.error("Failed to fetch users:", error)
      throw new Error("Failed to fetch users")
    }
  },

  updateUserStatus: async (userId: string, status: string) => {
    try {
      return await fetchApi(`/admin/users/${userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ data: { status } }),
      })
    } catch (error) {
      console.error("Failed to update user status:", error)
      throw new Error("Failed to update user status")
    }
  },

  updateUserRole: async (userId: string, role: string) => {
    try {
      return await fetchApi(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ data: { role } }),
      })
    } catch (error) {
      console.error("Failed to update user role:", error)
      throw new Error("Failed to update user role")
    }
  },

  // Content management
  getContent: async (page = 1, limit = 10, filters = {}) => {
    try {
      return await fetchApi("/admin/content", {
        method: "POST",
        body: JSON.stringify({ data: { page, limit, filters } }),
      })
    } catch (error) {
      console.error("Failed to fetch content:", error)
      throw new Error("Failed to fetch content")
    }
  },

  updateContentStatus: async (contentId: string, status: string) => {
    try {
      return await fetchApi(`/admin/content/${contentId}/status`, {
        method: "PUT",
        body: JSON.stringify({ data: { status } }),
      })
    } catch (error) {
      console.error("Failed to update content status:", error)
      throw new Error("Failed to update content status")
    }
  },

  // Message management
  getMessages: async (page = 1, limit = 10, filters = {}) => {
    try {
      return await fetchApi("/admin/messages", {
        method: "POST",
        body: JSON.stringify({ data: { page, limit, filters } }),
      })
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      throw new Error("Failed to fetch messages")
    }
  },

  sendSystemMessage: async (recipients: string[], subject: string, content: string) => {
    try {
      return await fetchApi("/admin/messages/send", {
        method: "POST",
        body: JSON.stringify({ data: { recipients, subject, content } }),
      })
    } catch (error) {
      console.error("Failed to send system message:", error)
      throw new Error("Failed to send system message")
    }
  },
}

export default adminApi
