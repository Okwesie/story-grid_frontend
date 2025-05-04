import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { data } = await request.json()
    const { page = 1, limit = 10 } = data || {}

    // Mock data for development
    const mockUsers = Array.from({ length: limit }, (_, i) => ({
      id: `user-${(page - 1) * limit + i + 1}`,
      username: `user${(page - 1) * limit + i + 1}`,
      email: `user${(page - 1) * limit + i + 1}@example.com`,
      role: i % 10 === 0 ? "admin" : "user",
      status: i % 5 === 0 ? "inactive" : "active",
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 1000000)).toISOString(),
      storiesCount: Math.floor(Math.random() * 50),
    }))

    return NextResponse.json({
      success: true,
      data: {
        users: mockUsers,
        total: 100, // Total number of users for pagination
        page,
        limit,
      },
      message: "Users fetched successfully",
    })
  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 },
    )
  }
}
