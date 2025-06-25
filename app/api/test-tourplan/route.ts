import { TourplanAPIDebug } from "@/lib/tourplan-api-debug"

export async function GET() {
  try {
    const config = {
      baseUrl: process.env.TOURPLAN_API_URL || "",
      username: process.env.TOURPLAN_USERNAME || "",
      password: process.env.TOURPLAN_PASSWORD || "",
      agentId: process.env.TOURPLAN_AGENT_ID || "",
    }

    console.log("Environment variables check:")
    console.log("TOURPLAN_API_URL:", config.baseUrl ? "✓ Set" : "✗ Missing")
    console.log("TOURPLAN_USERNAME:", config.username ? "✓ Set" : "✗ Missing")
    console.log("TOURPLAN_PASSWORD:", config.password ? "✓ Set" : "✗ Missing")
    console.log("TOURPLAN_AGENT_ID:", config.agentId ? "✓ Set" : "✗ Missing")

    const debugAPI = new TourplanAPIDebug(config)

    // Test basic connection
    const connectionTest = await debugAPI.testConnection()
    console.log("Connection test result:", connectionTest)

    // If connection works, test search
    let searchTest = null
    if (connectionTest.success) {
      searchTest = await debugAPI.testSearch()
      console.log("Search test result:", searchTest)
    }

    return Response.json({
      timestamp: new Date().toISOString(),
      environment: {
        hasApiUrl: !!config.baseUrl,
        hasUsername: !!config.username,
        hasPassword: !!config.password,
        hasAgentId: !!config.agentId,
      },
      connectionTest,
      searchTest,
    })
  } catch (error) {
    console.error("Tourplan test failed:", error)
    return Response.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
