export interface Author {
    id: string
    username: string
    email?: string
  }
  
  export interface MediaItem {
    id: string
    url: string
    type: string
    metadata?: {
      publicId?: string
      format?: string
      size?: number
      width?: number
      height?: number
    }
  }
  
  export interface Comment {
    id: string
    content: string
    createdAt: string
    user: {
      id: string
      username: string
      avatar?: string
    }
    replies?: Comment[]
    timeAgo?: string
  }
  
  export type StoryStatus = "draft" | "published" | "archived"
  export type StoryType = "visual" | "audio" | "video" | "interactive" | "mixed"
  
  export interface Story {
    id: string
    title: string
    content?: string
    description?: string
    status: StoryStatus
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
      avatar?: string
    }
    thumbnail?: string
    coverImage?: MediaItem
    media?: MediaItem[]
    likes?: { userId: string }[]
    likeCount?: number
    commentCount?: number
    userLiked?: boolean
    timeAgo?: string
    lastEdited?: string
    type?: StoryType
    views?: number
    comments: Comment[]
    engagementScore?: number
    excerpt?: string
  }
  
  export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
      total: number
      page: number
      pages: number
    }
  }
  