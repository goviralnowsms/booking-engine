import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hostConnectUrl = "https://pa-thisis.nx.tourplan.net/hostconnect/api/hostConnectApi"

    // Test with a basic SOAP envelope
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header />
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

    return NextResponse.json({
      success: response.status < 500,
      message: `SOAP request completed - HTTP ${response.status}`,
      details: {
        requestSoap: soapEnvelope,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseXml: responseText,
        isXmlResponse: responseText.includes("<?xml") || responseText.includes("<soap:"),
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `SOAP test failed: ${error}`,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
