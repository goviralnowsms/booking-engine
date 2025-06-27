import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiUrl = process.env.TOURPLAN_API_URL

    if (!apiUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "TOURPLAN_API_URL not configured",
        },
        { status: 400 },
      )
    }

    // Test basic connectivity to the API URL
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "TourPlan-Debug-Tool/1.0",
        },
      })

      clearTimeout(timeoutId)

      return NextResponse.json({
        success: true,
        message: `Successfully connected to ${apiUrl}`,
        httpStatus: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        url: apiUrl,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          {
            success: false,
            message: `Connection timeout to ${apiUrl}`,
            error: "TIMEOUT",
          },
          { status: 408 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          message: `Failed to connect to ${apiUrl}`,
          error: fetchError instanceof Error ? fetchError.message : "Unknown network error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Network test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
