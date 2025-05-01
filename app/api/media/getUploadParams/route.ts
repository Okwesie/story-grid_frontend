import { NextResponse } from "next/server"
import { getUploadParams } from "@/api/media-service"

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
    const { fileName, fileType } = data || {}

    if (!fileName || !fileType) {
      return NextResponse.json({ success: false, message: "Missing required parameters", data: null }, { status: 400 })
    }

    const response = await getUploadParams(fileName, fileType, token)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Get upload parameters error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to get upload parameters", data: null },
      { status: 500 },
    )
  }
}
