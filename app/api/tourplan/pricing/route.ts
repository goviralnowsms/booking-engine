import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tourId = searchParams.get("tourId")
  const date = searchParams.get("date")

  if (!tourId || !date) {
    return NextResponse.json(
      {
        success: false,
        error: "tourId and date are required",
      },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(`${process.env.TOURPLAN_API_URL}/pricing?tourId=${tourId}&date=${date}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TOURPLAN_USERNAME}:${process.env.TOURPLAN_PASSWORD}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get pricing: ${response.status}`)
    }

    const pricing = await response.json()

    return NextResponse.json({
      success: true,
      pricing,
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
