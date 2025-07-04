export interface TourplanConfig {
  apiUrl: string
  username: string
  password: string
  agentId: string
  proxyUrl?: string
  useProxy?: boolean
}

export interface TourplanSearchParams {
  destination?: string
  startDate?: string
  endDate?: string
  adults?: number
  children?: number
  serviceType?: string
  region?: string
}

export interface TourplanBookingParams {
  tourId: string
  startDate: string
  endDate: string
  adults: number
  children: number
  customerDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}

export interface TourplanResponse {
  success: boolean
  data?: any
  error?: string
  rawResponse?: string
}

export class TourplanAPI {
  private config: TourplanConfig

  constructor() {
    // Use environment variables if available, otherwise use empty defaults for demo mode
    this.config = {
      apiUrl: process.env.TOURPLAN_API_URL || "",
      username: process.env.TOURPLAN_USERNAME || "",
      password: process.env.TOURPLAN_PASSWORD || "",
      agentId: process.env.TOURPLAN_AGENT_ID || "",
      proxyUrl: process.env.TOURPLAN_PROXY_URL,
      useProxy: process.env.USE_TOURPLAN_PROXY === "true",
    }
  }

  private createAuthXml(): string {
    return `
      <AgentID>${this.config.agentId}</AgentID>
      <Username>${this.config.username}</Username>
      <Password>${this.config.password}</Password>
    `
  }

  private createSoapEnvelope(body: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
              xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
              xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`
  }

  private async makeRequest(soapAction: string, body: string): Promise<TourplanResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Tourplan API not configured - running in demo mode",
      }
    }

    const envelope = this.createSoapEnvelope(body)
    const url = this.config.useProxy && this.config.proxyUrl ? this.config.proxyUrl : this.config.apiUrl

    if (!url) {
      return {
        success: false,
        error: "No API URL configured",
      }
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: soapAction,
          "Content-Length": envelope.length.toString(),
          "User-Agent": "TourplanBookingEngine/1.0",
          Authorization: `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString("base64")}`,
        },
        body: envelope,
        signal: AbortSignal.timeout(30000),
      })

      const responseText = await response.text()

      if (!response.ok) {
        return {
          success: false,
          error: `Tourplan API error: ${response.status} ${response.statusText}`,
          rawResponse: responseText,
        }
      }

      return this.parseXmlResponse(responseText)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private parseXmlResponse(xmlString: string): TourplanResponse {
    try {
      const bodyMatch = xmlString.match(/<soap:Body[^>]*>(.*?)<\/soap:Body>/s)
      if (bodyMatch) {
        return {
          success: true,
          data: bodyMatch[1],
          rawResponse: xmlString,
        }
      }

      const errorMatch = xmlString.match(/<Error[^>]*>(.*?)<\/Error>/s)
      if (errorMatch) {
        return {
          success: false,
          error: errorMatch[1],
          rawResponse: xmlString,
        }
      }

      return {
        success: true,
        data: xmlString,
        rawResponse: xmlString,
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to parse XML response",
        rawResponse: xmlString,
      }
    }
  }

  async searchTours(params: TourplanSearchParams): Promise<TourplanResponse> {
    const searchBody = `
    <Search xmlns="http://tempuri.org/">
      ${this.createAuthXml()}
      <SearchRequest>
        <ServiceType>${params.serviceType || "Tour"}</ServiceType>
        <Destination>${params.destination || ""}</Destination>
        <Region>${params.region || ""}</Region>
        <StartDate>${params.startDate || ""}</StartDate>
        <EndDate>${params.endDate || ""}</EndDate>
        <Adults>${params.adults || 2}</Adults>
        <Children>${params.children || 0}</Children>
      </SearchRequest>
    </Search>`

    return this.makeRequest("http://tempuri.org/Search", searchBody)
  }

  async getTourDetails(tourId: string): Promise<TourplanResponse> {
    const detailsBody = `
    <GetTourDetails xmlns="http://tempuri.org/">
      ${this.createAuthXml()}
      <TourID>${tourId}</TourID>
    </GetTourDetails>`

    return this.makeRequest("http://tempuri.org/GetTourDetails", detailsBody)
  }

  async getOptionInfo(optionId: string): Promise<TourplanResponse> {
    const optionBody = `
    <OptionInfo xmlns="http://tempuri.org/">
      ${this.createAuthXml()}
      <OptionID>${optionId}</OptionID>
    </OptionInfo>`

    return this.makeRequest("http://tempuri.org/OptionInfo", optionBody)
  }

  async checkAvailability(tourId: string, date: string, adults: number, children: number): Promise<TourplanResponse> {
    const availabilityBody = `
    <CheckAvailability xmlns="http://tempuri.org/">
      ${this.createAuthXml()}
      <TourID>${tourId}</TourID>
      <Date>${date}</Date>
      <Adults>${adults}</Adults>
      <Children>${children}</Children>
    </CheckAvailability>`

    return this.makeRequest("http://tempuri.org/CheckAvailability", availabilityBody)
  }

  async createBooking(params: TourplanBookingParams): Promise<TourplanResponse> {
    const bookingBody = `
    <CreateBooking xmlns="http://tempuri.org/">
      ${this.createAuthXml()}
      <BookingRequest>
        <TourID>${params.tourId}</TourID>
        <StartDate>${params.startDate}</StartDate>
        <EndDate>${params.endDate}</EndDate>
        <Adults>${params.adults}</Adults>
        <Children>${params.children}</Children>
        <Customer>
          <FirstName>${params.customerDetails.firstName}</FirstName>
          <LastName>${params.customerDetails.lastName}</LastName>
          <Email>${params.customerDetails.email}</Email>
          <Phone>${params.customerDetails.phone}</Phone>
        </Customer>
      </BookingRequest>
    </CreateBooking>`

    return this.makeRequest("http://tempuri.org/CreateBooking", bookingBody)
  }

  async testConnection(): Promise<TourplanResponse> {
    const testBody = `
    <TestConnection xmlns="http://tempuri.org/">
      ${this.createAuthXml()}
    </TestConnection>`

    return this.makeRequest("http://tempuri.org/TestConnection", testBody)
  }

  isConfigured(): boolean {
    return !!(this.config.apiUrl && this.config.username && this.config.password && this.config.agentId)
  }

  getConfig() {
    return {
      apiUrl: this.config.apiUrl,
      username: this.config.username,
      agentId: this.config.agentId,
      configured: this.isConfigured(),
      useProxy: this.config.useProxy,
      proxyUrl: this.config.proxyUrl,
    }
  }
}

export const tourplanAPI = new TourplanAPI()
