export interface Author {
    id: string
    username: string
    email?: string
  }
  
  export interface MediaItem {
    id: string
    type: string
    url: string
    order: number
    metadata?: {
      caption?: string
      width?: number
      height?: number
    }
  }
  
  export type StoryStatus = "draft" | "published" | "archived"
  export type StoryType = "visual" | "audio" | "video" | "interactive"
  
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
    author?: Author
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
    comments?: number
    engagementScore?: number
  }
  
  export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
      total: number
      page: number
      pages: number
    }
  }
  