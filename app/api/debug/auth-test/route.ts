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
          message: "Missing API credentials",
          missing: {
            apiUrl: !apiUrl,
            username: !username,
            password: !password,
          },
        },
        { status: 400 },
      )
    }

    // Test authentication with different common endpoints
    const testEndpoints = ["/", "/api", "/v1", "/health", "/status", "/tours", "/products"]

    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`

    const results = []

    for (const endpoint of testEndpoints) {
      try {
        const fullUrl = `${apiUrl}${endpoint}`
        const response = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(5000),
        })

        results.push({
          endpoint,
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          success: response.status < 400,
          headers: Object.fromEntries(response.headers.entries()),
        })

        // If we get a successful response, we can stop testing
        if (response.status < 400) {
          break
        }
      } catch (error) {
        results.push({
          endpoint,
          url: `${apiUrl}${endpoint}`,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        })
      }
    }

    const successfulTests = results.filter((r) => r.success)

    return NextResponse.json({
      success: successfulTests.length > 0,
      message:
        successfulTests.length > 0
          ? `Authentication successful on ${successfulTests.length} endpoint(s)`
          : "Authentication failed on all tested endpoints",
      results,
      authMethod: "Basic Auth",
      testedEndpoints: testEndpoints.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
