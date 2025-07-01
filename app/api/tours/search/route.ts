import { type NextRequest, NextResponse } from "next/server"
import { searchTours } from "@/lib/tourplan-api"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const searchCriteria = await request.json()

    console.log("Search criteria received:", searchCriteria)

    const tours = await searchTours(searchCriteria)

    return NextResponse.json({
      success: true,
      tours: tours,
      message: `Found ${tours.length} tours`,
    })
  } catch (error) {
    console.error("Tour search API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search tours",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Tour search API is running",
    endpoint: "POST /api/tours/search",
  })
}
