import { NextResponse } from "next/server"

export async function GET() {
  const result = {
    timestamp: new Date().toISOString(),
    environment: {
      TOURPLAN_API_URL: process.env.TOURPLAN_API_URL || "NOT SET",
      TOURPLAN_USERNAME: process.env.TOURPLAN_USERNAME ? "SET" : "NOT SET",
      TOURPLAN_PASSWORD: process.env.TOURPLAN_PASSWORD ? "SET" : "NOT SET",
      TOURPLAN_AGENT_ID: process.env.TOURPLAN_AGENT_ID || "NOT SET",
    },
    tests: [],
  }

  // Test 1: Check if environment variables exist
  if (!process.env.TOURPLAN_API_URL) {
    result.tests.push({
      test: "Environment Check",
      status: "FAIL",
      message: "TOURPLAN_API_URL is not set",
    })
    return NextResponse.json(result, { status: 400 })
  }

  // Test 2: Basic URL validation
  try {
    new URL(process.env.TOURPLAN_API_URL)
    result.tests.push({
      test: "URL Validation",
      status: "PASS",
      message: "API URL is valid format",
    })
  } catch (error) {
    result.tests.push({
      test: "URL Validation",
      status: "FAIL",
      message: `Invalid URL format: ${error}`,
    })
    return NextResponse.json(result, { status: 400 })
  }

  // Test 3: Basic connectivity
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 5000)

    const response = await fetch(process.env.TOURPLAN_API_URL, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "TourPlan-Test/1.0",
      },
    })

    result.tests.push({
      test: "Basic Connectivity",
      status: response.ok ? "PASS" : "PARTIAL",
      message: `HTTP ${response.status} ${response.statusText}`,
      details: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      },
    })
  } catch (error) {
    result.tests.push({
      test: "Basic Connectivity",
      status: "FAIL",
      message: `Connection failed: ${error}`,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  // Test 4: Authentication test
  if (process.env.TOURPLAN_USERNAME && process.env.TOURPLAN_PASSWORD) {
    try {
      const authHeader = `Basic ${Buffer.from(`${process.env.TOURPLAN_USERNAME}:${process.env.TOURPLAN_PASSWORD}`).toString("base64")}`

      const response = await fetch(process.env.TOURPLAN_API_URL, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      })

      let responseText = ""
      try {
        responseText = await response.text()
      } catch (e) {
        responseText = "Could not read response"
      }

      result.tests.push({
        test: "Authentication",
        status: response.status < 400 ? "PASS" : "FAIL",
        message: `HTTP ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          responsePreview: responseText.substring(0, 500),
        },
      })
    } catch (error) {
      result.tests.push({
        test: "Authentication",
        status: "FAIL",
        message: `Auth test failed: ${error}`,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  try {
    const { url, auth } = await request.json()

    const result = {
      timestamp: new Date().toISOString(),
      testUrl: url,
      hasAuth: !!auth,
      tests: [],
    }

    // Test custom URL
    try {
      const headers: Record<string, string> = {
        "User-Agent": "TourPlan-Custom-Test/1.0",
        Accept: "application/json",
      }

      if (auth) {
        headers["Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(10000),
      })

      let responseText = ""
      try {
        responseText = await response.text()
      } catch (e) {
        responseText = "Could not read response"
      }

      result.tests.push({
        test: "Custom URL Test",
        status: response.status < 400 ? "PASS" : "FAIL",
        message: `HTTP ${response.status} ${response.statusText}`,
        details: {
          url,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          responsePreview: responseText.substring(0, 1000),
        },
      })
    } catch (error) {
      result.tests.push({
        test: "Custom URL Test",
        status: "FAIL",
        message: `Request failed: ${error}`,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid request",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 400 },
    )
  }
}
