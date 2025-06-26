import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const proxyUrl = process.env.TOURPLAN_PROXY_URL

    if (!proxyUrl) {
      return NextResponse.json({ error: "TOURPLAN_PROXY_URL not configured" }, { status: 500 })
    }

    // Test XML request
    const testXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE Request SYSTEM "hostConnect_5_05_000.dtd">
<Request>
  <OptionInfoRequest>
    <AgentID>SAMAGT</AgentID>
    <Password>S@MAgt01</Password>
    <ButtonName>Day Tours</ButtonName>
    <DestinationName>Cape Town</DestinationName>
    <Info>GS</Info>
  </OptionInfoRequest>
</Request>`

    console.log("Testing proxy at:", proxyUrl)

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        xmlBody: testXML,
        targetUrl: process.env.TOURPLAN_API_URL,
        agentId: "SAMAGT",
      }),
    })

    const result = await response.json()

    return NextResponse.json({
      success: response.ok,
      proxyUrl,
      response: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Proxy test failed:", error)
    return NextResponse.json(
      {
        error: "Proxy test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Proxy test endpoint",
    description: "POST to test the AWS Lambda proxy connection",
    proxyUrl: process.env.TOURPLAN_PROXY_URL || "Not configured",
    useProxy: process.env.USE_TOURPLAN_PROXY || "false",
  })
}
