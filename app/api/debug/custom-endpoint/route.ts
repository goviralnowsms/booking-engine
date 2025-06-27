import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        {
          success: false,
          message: "Endpoint path required",
        },
        { status: 400 },
      )
    }

    const apiUrl = process.env.TOURPLAN_API_URL
    const username = process.env.TOURPLAN_USERNAME
    const password = process.env.TOURPLAN_PASSWORD

    if (!apiUrl || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing API configuration",
        },
        { status: 400 },
      )
    }

    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
    const fullUrl = `${apiUrl}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    })

    const contentType = response.headers.get("content-type")
    let responseData = null

    try {
      if (contentType?.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
    } catch {
      responseData = "Could not parse response"
    }

    return NextResponse.json({
      success: response.status < 400,
      message: `${response.status} ${response.statusText}`,
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      contentType,
      headers: Object.fromEntries(response.headers.entries()),
      responseData,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Custom endpoint test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
