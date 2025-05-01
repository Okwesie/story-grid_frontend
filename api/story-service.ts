import type { StoryData, Story, ApiResponse, ApiError } from "@/lib/api"

/**
 * Creates a new story
 * @param storyData - The story data to create
 * @param token - The authentication token
 * @returns Promise with the creation result
 */
export const createStory = async (storyData: StoryData, token: string): Promise<ApiResponse<Story>> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/story/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storyData),
    })

    const result = await response.json()

    return {
      success: result.status === 201,
      data: result.data,
      message: result.msg,
    }
  } catch (error) {
    console.error("Create story error:", error)
    const err = error as ApiError
    return {
      success: false,
      data: null,
      message: err.message || "Failed to create story",
    }
  }
}
