import type { MediaData, UploadParams, ApiResponse, ApiError } from "@/lib/api"

/**
 * Gets upload parameters for direct Cloudinary upload
 * @param fileName - Name of the file to upload
 * @param fileType - MIME type of the file
 * @param token - Authentication token
 * @returns Promise with upload parameters
 */
export const getUploadParams = async (
  fileName: string,
  fileType: string,
  token: string,
): Promise<ApiResponse<UploadParams>> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/getUploadParams`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileName, fileType }),
    })

    const result = await response.json()

    return {
      success: result.status === 200,
      data: result.data,
      message: result.msg,
    }
  } catch (error) {
    console.error("Get upload parameters error:", error)
    const err = error as ApiError
    return {
      success: false,
      data: null,
      message: err.message || "Failed to get upload parameters",
    }
  }
}

/**
 * Saves information about an uploaded media file
 * @param mediaData - Data about the uploaded media
 * @param token - Authentication token
 * @returns Promise with the saved media record
 */
export const saveUploadedMedia = async (mediaData: any, token: string): Promise<ApiResponse<MediaData>> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/saveUploadedMedia`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mediaData),
    })

    const result = await response.json()

    return {
      success: result.status === 201,
      data: result.data,
      message: result.msg,
    }
  } catch (error) {
    console.error("Save uploaded media error:", error)
    const err = error as ApiError
    return {
      success: false,
      data: null,
      message: err.message || "Failed to save uploaded media",
    }
  }
}
