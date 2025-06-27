import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hostConnectUrl = "https://pa-thisis.nx.tourplan.net/hostconnect/api/hostConnectApi"

    // Test basic connectivity
    const response = await fetch(hostConnectUrl, {
      method: "GET",
      headers: {
        "User-Agent": "TourPlan-HostConnect-Test/1.0",
        Accept: "*/*",
      },
      signal: AbortSignal.timeout(10000),
    })

    const responseText = await response.text()

    return NextResponse.json({
      success: true,
      message: `Connected to HostConnect API - HTTP ${response.status}`,
      details: {
        url: hostConnectUrl,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responsePreview: responseText.substring(0, 500),
        responseLength: responseText.length,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `HostConnect connection failed: ${error}`,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
