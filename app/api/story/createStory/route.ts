import { NextResponse } from "next/server"
import { createStory } from "@/api/story-service"

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
    const response = await createStory(data, token)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Create story error:", error)
    return NextResponse.json({ success: false, message: "Failed to create story", data: null }, { status: 500 })
  }
}
