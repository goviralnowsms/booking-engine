import { NextResponse } from "next/server"

export async function GET() {
  try {
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

    // Common API endpoint patterns to test
    const endpointPatterns = [
      // Root endpoints
      { path: "/", description: "Root endpoint" },
      { path: "/api", description: "API root" },
      { path: "/v1", description: "Version 1 API" },
      { path: "/api/v1", description: "API Version 1" },

      // Health/Status endpoints
      { path: "/health", description: "Health check" },
      { path: "/status", description: "Status check" },
      { path: "/ping", description: "Ping endpoint" },

      // TourPlan specific endpoints
      { path: "/tours", description: "Tours listing" },
      { path: "/products", description: "Products listing" },
      { path: "/availability", description: "Availability check" },
      { path: "/bookings", description: "Bookings endpoint" },

      // With API prefix
      { path: "/api/tours", description: "API Tours" },
      { path: "/api/products", description: "API Products" },
      { path: "/v1/tours", description: "V1 Tours" },
      { path: "/api/v1/tours", description: "API V1 Tours" },
    ]

    const results = []

    for (const pattern of endpointPatterns) {
      try {
        const fullUrl = `${apiUrl}${pattern.path}`
        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(3000),
        })

        const contentType = response.headers.get("content-type")
        let responseData = null

        try {
          if (contentType?.includes("application/json")) {
            responseData = await response.json()
          } else {
            const text = await response.text()
            responseData = text.substring(0, 200) // First 200 chars
          }
        } catch {
          responseData = "Could not parse response"
        }

        results.push({
          ...pattern,
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          success: response.status < 400,
          contentType,
          responseData,
        })
      } catch (error) {
        results.push({
          ...pattern,
          url: `${apiUrl}${pattern.path}`,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        })
      }
    }

    const workingEndpoints = results.filter((r) => r.success)

    return NextResponse.json({
      success: workingEndpoints.length > 0,
      message: `Found ${workingEndpoints.length} working endpoint(s) out of ${results.length} tested`,
      results,
      workingEndpoints: workingEndpoints.map((e) => ({ path: e.path, status: e.status })),
      summary: {
        total: results.length,
        working: workingEndpoints.length,
        failed: results.length - workingEndpoints.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Endpoint discovery failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
