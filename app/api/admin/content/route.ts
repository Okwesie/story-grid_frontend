import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { data } = await request.json()
    const { page = 1, limit = 10 } = data || {}

    // Mock data for development
    const contentTypes = ["visual", "audio", "video", "interactive"]
    const statuses = ["published", "draft", "archived", "flagged"]

    const mockContent = Array.from({ length: limit }, (_, i) => ({
      id: `content-${(page - 1) * limit + i + 1}`,
      title: `Story Title ${(page - 1) * limit + i + 1}`,
      author: {
        id: `user-${Math.floor(Math.random() * 100) + 1}`,
        username: `author${Math.floor(Math.random() * 100) + 1}`,
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
      publishedAt:
        Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString() : null,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 500),
    }))

    return NextResponse.json({
      success: true,
      data: {
        content: mockContent,
        total: 250, // Total number of content items for pagination
        page,
        limit,
      },
      message: "Content fetched successfully",
    })
  } catch (error) {
    console.error("Error in content API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch content",
      },
      { status: 500 },
    )
  }
}
