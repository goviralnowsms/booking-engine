import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch(`${process.env.TOURPLAN_API_URL}/tours`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TOURPLAN_USERNAME}:${process.env.TOURPLAN_PASSWORD}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch tours: ${response.status}`)
    }

    const tours = await response.json()

    return NextResponse.json({
      success: true,
      tours: tours.slice(0, 5), // Limit to first 5 for testing
      total: tours.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
