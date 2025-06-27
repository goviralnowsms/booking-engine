import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test basic API connection
    const response = await fetch(`${process.env.TOURPLAN_API_URL}/health`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TOURPLAN_USERNAME}:${process.env.TOURPLAN_PASSWORD}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Production API connection successful",
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
