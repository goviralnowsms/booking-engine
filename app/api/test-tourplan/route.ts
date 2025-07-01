// Force Node.js runtime instead of Edge
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getTourplanAPI } from "@/lib/tourplan-api"

export async function GET() {
  try {
    console.log("=== TOURPLAN API TEST (Node.js Runtime) ===")

    const envCheck = {
      apiUrl: !!process.env.TOURPLAN_API_URL,
      username: !!process.env.TOURPLAN_USERNAME,
      password: !!process.env.TOURPLAN_PASSWORD,
      agentId: !!process.env.TOURPLAN_AGENT_ID,
    }

    const tourplanAPI = getTourplanAPI()

    let connectionResult
    let searchResult

    try {
      connectionResult = await tourplanAPI.getOptionInfo({
        buttonName: "Day Tours",
        destinationName: "Cape Town",
        info: "G",
      })
    } catch (error) {
      connectionResult = { error: error instanceof Error ? error.message : "Unknown error" }
    }

    try {
      searchResult = await tourplanAPI.searchTours({
        destination: "Cape Town",
        country: "South Africa",
        adults: 2,
      })
    } catch (error) {
      searchResult = { error: error instanceof Error ? error.message : "Unknown error" }
    }

    return NextResponse.json({
      success: true,
      runtime: "nodejs",
      timestamp: new Date().toISOString(),
      environment: envCheck,
      connectionTest: connectionResult,
      searchTest: searchResult,
    })
  } catch (error) {
    console.error("Test failed:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
