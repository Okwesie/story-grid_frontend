import { NextResponse } from "next/server"
import { saveUploadedMedia } from "@/api/media-service"

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token found", data: null },
        { status: 401 },
      )
    }

    const { data } = await request.json()
    const { url, type, storyId, metadata } = data || {}

    if (!url || !type) {
      return NextResponse.json({ success: false, message: "Missing required parameters", data: null }, { status: 400 })
    }

    const response = await saveUploadedMedia({ url, type, storyId, metadata }, token)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Save uploaded media error:", error)
    return NextResponse.json({ success: false, message: "Failed to save uploaded media", data: null }, { status: 500 })
  }
}
