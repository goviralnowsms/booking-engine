import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  const tourId = searchParams.get("tourId")

  if (!date || !tourId) {
    return NextResponse.json(
      {
        success: false,
        error: "Date and tourId are required",
      },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(`${process.env.TOURPLAN_API_URL}/availability?date=${date}&tourId=${tourId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TOURPLAN_USERNAME}:${process.env.TOURPLAN_PASSWORD}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to check availability: ${response.status}`)
    }

    const availability = await response.json()

    return NextResponse.json({
      success: true,
      availability,
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
