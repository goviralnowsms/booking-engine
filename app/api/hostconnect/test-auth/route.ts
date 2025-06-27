import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hostConnectUrl = "https://pa-thisis.nx.tourplan.net/hostconnect/api/hostConnectApi"
    const username = process.env.TOURPLAN_USERNAME
    const password = process.env.TOURPLAN_PASSWORD
    const agentId = process.env.TOURPLAN_AGENT_ID

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: "Missing TOURPLAN_USERNAME or TOURPLAN_PASSWORD",
      })
    }

    // Test with authentication in SOAP envelope
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <Authentication xmlns="http://hostconnect.tourplan.com/">
      <Username>${username}</Username>
      <Password>${password}</Password>
      ${agentId ? `<AgentId>${agentId}</AgentId>` : ""}
    </Authentication>
  </soap:Header>
  <soap:Body>
    <GetVersion xmlns="http://hostconnect.tourplan.com/">
    </GetVersion>
  </soap:Body>
</soap:Envelope>`

    const response = await fetch(hostConnectUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "http://hostconnect.tourplan.com/GetVersion",
        "User-Agent": "TourPlan-HostConnect-Test/1.0",
      },
      body: soapEnvelope,
      signal: AbortSignal.timeout(10000),
    })

    const responseText = await response.text()

    // Check for common authentication success/failure indicators
    const isAuthSuccess =
      !responseText.includes("Authentication") ||
      !responseText.includes("Unauthorized") ||
      !responseText.includes("Invalid") ||
      response.status === 200

    return NextResponse.json({
      success: isAuthSuccess && response.status < 400,
      message: `Authentication test - HTTP ${response.status}`,
      details: {
        hasCredentials: { username: !!username, password: !!password, agentId: !!agentId },
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseXml: responseText,
        authIndicators: {
          containsAuthError: responseText.includes("Authentication") || responseText.includes("Unauthorized"),
          containsInvalidError: responseText.includes("Invalid"),
          httpOk: response.status < 400,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Authentication test failed: ${error}`,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
