import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hostConnectUrl = "https://pa-thisis.nx.tourplan.net/hostconnect/api/hostConnectApi"
    const username = process.env.TOURPLAN_USERNAME
    const password = process.env.TOURPLAN_PASSWORD
    const agentId = process.env.TOURPLAN_AGENT_ID

    // Test a basic operation like GetSuppliers or GetProducts
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
    <GetSuppliers xmlns="http://hostconnect.tourplan.com/">
    </GetSuppliers>
  </soap:Body>
</soap:Envelope>`

    const response = await fetch(hostConnectUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "http://hostconnect.tourplan.com/GetSuppliers",
        "User-Agent": "TourPlan-HostConnect-Test/1.0",
      },
      body: soapEnvelope,
      signal: AbortSignal.timeout(15000),
    })

    const responseText = await response.text()

    // Check for successful operation indicators
    const hasData =
      responseText.includes("<Supplier") ||
      responseText.includes("<Product") ||
      responseText.includes("GetSuppliersResponse")

    const hasError =
      responseText.includes("soap:Fault") || responseText.includes("Error") || responseText.includes("Exception")

    return NextResponse.json({
      success: response.status === 200 && hasData && !hasError,
      message: `GetSuppliers operation - HTTP ${response.status}`,
      details: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseXml: responseText,
        analysis: {
          hasData,
          hasError,
          responseLength: responseText.length,
          containsSuppliers: responseText.includes("<Supplier"),
          containsFault: responseText.includes("soap:Fault"),
        },
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Operation test failed: ${error}`,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
