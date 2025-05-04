import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { data } = await request.json()
    const { page = 1, limit = 10 } = data || {}

    // Mock data for development
    const statuses = ["read", "unread"]

    const mockMessages = Array.from({ length: limit }, (_, i) => ({
      id: `message-${(page - 1) * limit + i + 1}`,
      sender: {
        id: `user-${Math.floor(Math.random() * 100) + 1}`,
        username: `user${Math.floor(Math.random() * 100) + 1}`,
      },
      recipient: {
        id: `user-${Math.floor(Math.random() * 100) + 1}`,
        username: `user${Math.floor(Math.random() * 100) + 1}`,
      },
      subject: `Message Subject ${(page - 1) * limit + i + 1}`,
      content: `This is the content of message ${(page - 1) * limit + i + 1}. It contains some text that would be displayed in the message body.`,
      status: statuses[Math.floor(Math.random() * statuses.length)] as "read" | "unread",
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        messages: mockMessages,
        total: 150, // Total number of messages for pagination
        page,
        limit,
      },
      message: "Messages fetched successfully",
    })
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch messages",
      },
      { status: 500 },
    )
  }
}
