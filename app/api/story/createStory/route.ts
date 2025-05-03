import { NextResponse } from "next/server"
import { createStory } from "@/api/story-service"

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      console.error("No authentication token found")
      return NextResponse.json(
        { success: false, message: "No authentication token found", data: null },
        { status: 401 },
      )
    }

    const body = await request.json()
    console.log("API route received data:", JSON.stringify(body, null, 2))
    
    const { data } = body
    
    // Validate required fields
    if (!data || !data.title || !data.content) {
      console.error("Missing required fields:", data)
      return NextResponse.json(
        { success: false, message: "Missing required fields", data: null },
        { status: 400 },
      )
    }
    
    console.log("Sending to backend:", JSON.stringify(data, null, 2))
    
    const response = await createStory(data, token)
    console.log("Backend response:", response)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("Create story error:", error)
    return NextResponse.json({ success: false, message: "Failed to create story", data: null }, { status: 500 })
  }
}
