import { NextResponse } from "next/server"

export async function GET() {
  try {
    // This is mock data for development
    const mockDashboardMetrics = {
      totalUsers: 1250,
      activeUsers: 876,
      totalStories: 3420,
      publishedStories: 2845,
      draftStories: 575,
      totalComments: 12680,
      totalLikes: 28450,
      newUsersToday: 24,
      newStoriesThisWeek: 128,
    }

    return NextResponse.json({
      success: true,
      data: mockDashboardMetrics,
      message: "Dashboard metrics fetched successfully",
    })
  } catch (error) {
    console.error("Error in dashboard metrics API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard metrics",
      },
      { status: 500 },
    )
  }
}
