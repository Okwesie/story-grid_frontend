// Media types
export interface MediaData {
  url: string
  type: string
  mediaId: string
  order?: number
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
    apiKey: string
    cloudName: string
    uploadParams: {
      timestamp: number
      signature: string
      folder: string
      public_id?: string
    }
  }
}

// Story types
export interface CoverImageData {
  url: string
  type: string
  mediaId: string
  metadata: {
    publicId: string
    format: string
    size: number
    width?: number
    height?: number
  }
}

export interface StoryData {
  title: string
  description: string
  tags: string[]
  coverImage?: CoverImageData | null
  blocks: {
    type: string
    content: string
    caption: string
    mediaId?: string
  }[]
  media?: MediaData[]
  isDraft?: boolean
}

export interface Story {
  id: string
  title: string
  content: string
  author: {
    id: string
    username: string
    email: string
    avatar?: string
  }
  media: MediaData[]
  likeCount: number
  commentCount: number
  userLiked: boolean
  timeAgo: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
}

// Error handling
export interface ApiError extends Error {
  status?: number
  data?: any
} 