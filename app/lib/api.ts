import { fetchApi } from './fetch';

export interface MediaData {
  id: string;
  url: string;
  type: string;
  metadata?: {
    publicId?: string;
    format?: string;
    size?: number;
    width?: number;
    height?: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}

// Story related types
export interface StoryBlock {
  type: string;
  content: string;
  caption?: string;
  mediaId?: string;
}

export interface StoryData {
  title: string;
  description?: string;
  tags?: string[];
  coverImage?: MediaData;
  blocks?: StoryBlock[];
  isDraft?: boolean;
}

export interface StoriesApi {
  uploadMedia: (formData: FormData) => Promise<ApiResponse<MediaData>>;
  createStory: (storyData: StoryData) => Promise<ApiResponse<any>>;
  getAllStories: (params?: { status?: string; limit?: number; page?: number }) => Promise<ApiResponse<any>>;
  getDashboardStories: () => Promise<ApiResponse<any>>;
  getStoryById: (id: string) => Promise<ApiResponse<any>>;
  deleteStory: (id: string) => Promise<ApiResponse<any>>;
  likeStory: (storyId: string) => Promise<ApiResponse<any>>;
  unlikeStory: (storyId: string) => Promise<ApiResponse<any>>;
  getRecommendedStories: () => Promise<ApiResponse<any>>;
  updateStory: (id: string, data: Partial<StoryData>) => Promise<ApiResponse<any>>;
}

// Stories-related API functions
export const storiesApi: StoriesApi = {
  uploadMedia: async (formData: FormData) => {
    return fetchApi("/media/upload", {
      method: "POST",
      body: formData,
    });
  },

  createStory: async (storyData: StoryData) => {
    return fetchApi("/story/createStory", {
      method: "POST",
      body: JSON.stringify({ data: storyData }),
    });
  },

  getAllStories: async (params = {}) => {
    return fetchApi("/story/getDashboardStories", {
      method: "POST",
      body: JSON.stringify({ data: params }),
    });
  },

  getDashboardStories: async () => {
    return fetchApi("/story/getDashboardStories", { method: "POST" });
  },

  getStoryById: async (id: string) => {
    return fetchApi("/story/getStory", {
      method: "POST",
      body: JSON.stringify({ data: { id } }),
    });
  },

  deleteStory: async (id: string) => {
    return fetchApi("/story/deleteStory", {
      method: "POST",
      body: JSON.stringify({ data: { id } }),
    });
  },

  likeStory: async (storyId: string) => {
    return fetchApi("/story/likeStory", {
      method: "POST",
      body: JSON.stringify({ data: { storyId } }),
    });
  },

  unlikeStory: async (storyId: string) => {
    return fetchApi("/story/unlikeStory", {
      method: "POST",
      body: JSON.stringify({ data: { storyId } }),
    });
  },

  getRecommendedStories: async () => {
    return fetchApi("/feed/getDiscover", {
      method: "POST",
    });
  },

  updateStory: async (id: string, data: Partial<StoryData>) => {
    return fetchApi("/story/updateStory", {
      method: "POST",
      body: JSON.stringify({ data: { id, ...data } }),
    });
  },
};