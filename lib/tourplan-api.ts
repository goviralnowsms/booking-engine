import { parseStringPromise } from "xml2js"
import { CacheManager } from "./cache"

export interface TourplanConfig {
  baseUrl: string
  soapSearchUrl: string
  username: string
  password: string
  agentId: string
}

export interface TourplanTour {
  tourId: string
  tourName: string
  description: string
  duration: number
  priceFrom: number
  currency: string
  tourLevel: string
  supplierId: string
  supplierName: string
  destination: string
  country: string
  availability: "OK" | "RQ" | "NO"
  maxParticipants?: number
  minParticipants?: number
  extras: TourplanExtra[]
  cancellationDeadline?: string
}

export interface TourplanExtra {
  extraId: string
  extraName: string
  description: string
  price: number
  currency: string
  isCompulsory: boolean
  isPerPerson: boolean
}

export interface TourplanBookingRequest {
  tourId: string
  startDate: string
  endDate: string
  adults: number
  children: number
  selectedExtras: string[]
  customerDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
  }
  createAsProvisional?: boolean
}

export interface TourplanBookingResponse {
  bookingId: string
  bookingReference: string
  status: "confirmed" | "pending" | "failed"
  totalPrice: number
  currency: string
  cancellationDeadline?: string
  confirmationDetails?: any
}

export interface PaymentStatusUpdate {
  bookingId: string
  paymentType: "deposit" | "final" | "extra"
  amount: number
  currency: string
  paymentReference: string
  paymentDate: string
  paymentMethod: string
}

export class TourplanAPI {
  private config: TourplanConfig

  constructor(config: TourplanConfig) {
    this.config = config
  }

  private async makeRequest(xmlBody: string, useSoapEndpoint: boolean = false): Promise<any> {
    try {
      const url = useSoapEndpoint ? this.config.soapSearchUrl : this.config.baseUrl
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "",
        },
        body: xmlBody,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const xmlText = await response.text()
      const result = await parseStringPromise(xmlText)
      return result
    } catch (error) {
      console.error("Tourplan API request failed:", error)
      throw error
    }
  }

  private buildOptionInfoXML(params: {
    agentId: string
    password: string
    buttonName?: string
    destinationName?: string
    opt?: string
    info: string
    dateFrom?: string
    dateTo?: string
    roomConfigs?: Array<{
      adults: number
      roomType: string
    }>
  }): string {
    // Support both old format (ButtonName/DestinationName) and new format (Opt/DateFrom/DateTo/RoomConfigs)
    if (params.opt) {
      // New format with Opt, DateFrom, DateTo, RoomConfigs
      const roomConfigsXML = params.roomConfigs?.map(config =>
        `      <RoomConfig>
        <Adults>${config.adults}</Adults>
        <RoomType>${config.roomType}</RoomType>
      </RoomConfig>`
      ).join('\n') || '';

      return `<?xml version="1.0"?>
<!DOCTYPE Request SYSTEM "hostConnect_5_05_000.dtd">
<Request>
  <OptionInfoRequest>
    <AgentID>${params.agentId}</AgentID>
    <Password>${params.password}</Password>
    <Opt>${params.opt}</Opt>
    <Info>${params.info}</Info>
    ${params.dateFrom ? `<DateFrom>${params.dateFrom}</DateFrom>` : ''}
    ${params.dateTo ? `<DateTo>${params.dateTo}</DateTo>` : ''}
    ${roomConfigsXML ? `<RoomConfigs>\n${roomConfigsXML}\n    </RoomConfigs>` : ''}
  </OptionInfoRequest>
</Request>`
    } else {
      // Original format with ButtonName/DestinationName
      return `<?xml version="1.0"?>
<!DOCTYPE Request SYSTEM "hostConnect_5_05_000.dtd">
<Request>
  <OptionInfoRequest>
    <AgentID>${params.agentId}</AgentID>
    <Password>${params.password}</Password>
    <ButtonName>${params.buttonName}</ButtonName>
    <DestinationName>${params.destinationName}</DestinationName>
    <Info>${params.info}</Info>
  </OptionInfoRequest>
</Request>`
    }
  }

  private buildSearchXML(params: {
    country?: string
    destination?: string
    tourLevel?: string
    startDate?: string
    endDate?: string
    adults?: number
    children?: number
    childrenAges?: number[]
  }): string {
    // Build room configurations based on adults/children
    const adults = params.adults || 2
    const roomType = adults === 1 ? "SG" : "DB" // Single or Double room
    
    // Use a more specific date format and ensure it's in the future
    const searchDate = params.startDate || "2025-07-01"
    
    // Map destination to known Tourplan destinations
    const destinationMapping: Record<string, string> = {
      "cape town": "Cape Town",
      "johannesburg": "Johannesburg",
      "durban": "Durban",
      "kruger": "Kruger National Park",
      "garden route": "Garden Route",
      "stellenbosch": "Stellenbosch",
      "hermanus": "Hermanus"
    }
    
    const destination = params.destination ?
      destinationMapping[params.destination.toLowerCase()] || params.destination :
      "Cape Town"

    return `<?xml version="1.0"?>
<!DOCTYPE Request SYSTEM "hostConnect_5_05_000.dtd">
<Request>
  <OptionInfoRequest>
    <AgentID>${this.config.agentId}</AgentID>
    <Password>${this.config.password}</Password>
    <ButtonName>Day Tours</ButtonName>
    <DestinationName>${destination}</DestinationName>
    <Info>GS</Info>
    <DateFrom>${searchDate}</DateFrom>
    <RateConvert>Y</RateConvert>
    <RoomConfigs>
      <RoomConfig>
        <Adults>${adults}</Adults>
        <RoomType>${roomType}</RoomType>
      </RoomConfig>
    </RoomConfigs>
  </OptionInfoRequest>
</Request>`
  }

  private parseTourData(xmlData: any): TourplanTour[] {
    try {
      // Parse OptionInfoReply response format
      const reply = xmlData?.Request?.OptionInfoReply?.[0]
      if (!reply) {
        console.log("No OptionInfoReply found in response")
        console.log("Available keys in xmlData:", Object.keys(xmlData || {}))
        if (xmlData?.Request) {
          console.log("Available keys in Request:", Object.keys(xmlData.Request))
        }
        return []
      }

      // Extract tour options from the reply
      const options = reply.Option || []
      console.log(`Found ${options.length} options in OptionInfoReply`)
      
      if (options.length === 0) {
        console.log("No options found in reply")
        console.log("Reply structure:", JSON.stringify(reply, null, 2))
        return []
      }

      const tours = options.map((option: any, index: number) => {
        // Parse duration from description or name if available
        let duration = 1
        const durationMatch = (option.$.OptName || option.OptDesc?.[0] || "").match(/(\d+)\s*(day|hour)/i)
        if (durationMatch) {
          duration = parseInt(durationMatch[1])
          if (durationMatch[2].toLowerCase() === 'hour' && duration < 24) {
            duration = 1 // Convert hours to days, minimum 1 day
          }
        }

        // Parse price and ensure it's a valid number
        const priceStr = option.$.OptPrice || option.$.Price || "0"
        const price = parseFloat(priceStr.replace(/[^\d.-]/g, '')) || 0

        // Determine tour level based on price or name
        let tourLevel = "standard"
        if (price > 2000) tourLevel = "luxury"
        else if (price < 500) tourLevel = "basic"
        
        const tourName = option.$.OptName || option.$.OptCode || `Tour ${index + 1}`
        if (tourName.toLowerCase().includes('luxury') || tourName.toLowerCase().includes('premium')) {
          tourLevel = "luxury"
        }

        // Extract country and destination
        const destination = option.$.Destination || option.$.DestinationName || ""
        const country = option.$.Country || "South Africa" // Default for this API

        return {
          tourId: option.$.OptCode || `tour-${Date.now()}-${index}`,
          tourName: tourName,
          description: option.OptDesc?.[0] || option.$.OptDesc || option.$.OptName || `Experience ${tourName}`,
          duration: duration,
          priceFrom: price,
          currency: option.$.Currency || option.$.Curr || "ZAR",
          tourLevel: tourLevel,
          supplierId: option.$.SuppCode || option.$.SupplierCode || "",
          supplierName: option.$.SuppName || option.$.SupplierName || "Local Operator",
          destination: destination,
          country: country,
          availability: (option.$.Avail as "OK" | "RQ" | "NO") || "OK",
          maxParticipants: parseInt(option.$.MaxPax || option.$.MaxParticipants || "0") || undefined,
          minParticipants: parseInt(option.$.MinPax || option.$.MinParticipants || "1") || 1,
          cancellationDeadline: option.$.CancelDeadline || undefined,
          extras: [], // Will be populated separately if needed
        }
      })

      console.log(`Successfully parsed ${tours.length} tours from Tourplan API`)
      tours.forEach((tour, i) => {
        console.log(`Tour ${i + 1}: ${tour.tourName} - ${tour.currency} ${tour.priceFrom}`)
      })

      return tours
    } catch (error) {
      console.error("Error parsing tour data:", error)
      console.error("XML data structure:", JSON.stringify(xmlData, null, 2))
      return []
    }
  }

  private parseExtrasData(extrasData: any[]): TourplanExtra[] {
    return extrasData.map((extra: any) => ({
      extraId: extra.ExtraId?.[0] || "",
      extraName: extra.ExtraName?.[0] || "",
      description: extra.Description?.[0] || "",
      price: Number.parseFloat(extra.Price?.[0] || "0"),
      currency: extra.Currency?.[0] || "USD",
      isCompulsory: extra.IsCompulsory?.[0] === "true",
      isPerPerson: extra.IsPerPerson?.[0] === "true",
    }))
  }

  async getOptionInfo(params: {
    buttonName?: string
    destinationName?: string
    opt?: string
    info: string
    dateFrom?: string
    dateTo?: string
    roomConfigs?: Array<{
      adults: number
      roomType: string
    }>
  }): Promise<any> {
    // Check if we have valid Tourplan credentials
    if (!this.config.baseUrl || !this.config.username || !this.config.password || !this.config.agentId) {
      console.log("Tourplan credentials not configured, returning mock data")
      return this.getMockOptionInfo(params)
    }

    try {
      const xmlBody = this.buildOptionInfoXML({
        agentId: this.config.agentId,
        password: this.config.password,
        buttonName: params.buttonName,
        destinationName: params.destinationName,
        opt: params.opt,
        info: params.info,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        roomConfigs: params.roomConfigs
      })
      
      console.log("Sending OptionInfoRequest:", xmlBody)
      const xmlResponse = await this.makeRequest(xmlBody)
      console.log("OptionInfoRequest response:", JSON.stringify(xmlResponse, null, 2))
      
      return this.parseOptionInfoData(xmlResponse)
    } catch (error) {
      console.error("Tourplan OptionInfo API failed, falling back to mock data:", error)
      return this.getMockOptionInfo(params)
    }
  }

  private parseOptionInfoData(xmlData: any): any {
    try {
      // Parse the OptionInfoReply from the XML response
      const reply = xmlData?.Request?.OptionInfoReply?.[0]
      if (reply) {
        return {
          success: true,
          data: reply
        }
      }
      
      // Check for error response
      const errorReply = xmlData?.Request?.ErrorReply?.[0]
      if (errorReply) {
        return {
          success: false,
          error: errorReply.Error?.[0] || "Unknown error"
        }
      }
      
      return {
        success: false,
        error: "Unexpected response format"
      }
    } catch (error) {
      console.error("Error parsing OptionInfo data:", error)
      return {
        success: false,
        error: "Failed to parse response"
      }
    }
  }

  private getMockOptionInfo(params: {
    buttonName?: string
    destinationName?: string
    opt?: string
    info: string
    dateFrom?: string
    dateTo?: string
    roomConfigs?: Array<{
      adults: number
      roomType: string
    }>
  }): any {
    const identifier = params.opt || params.destinationName || "unknown";
    return {
      success: true,
      data: {
        buttonName: params.buttonName,
        destinationName: params.destinationName,
        opt: params.opt,
        info: params.info,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        roomConfigs: params.roomConfigs,
        description: `Mock option info for ${identifier}`,
        details: "This is mock data returned when Tourplan API is not configured"
      }
    }
  }

  async checkAvailability(tourId: string, date: string): Promise<any> {
    // Mock implementation for now
    console.log(`Checking availability for tour ${tourId} on ${date}`)
    return {
      tourId,
      date,
      available: true,
      spaces: 10,
      price: 1200,
      currency: "USD"
    }
  }

  async searchTours(params: {
    country?: string
    destination?: string
    tourLevel?: string
    startDate?: string
    endDate?: string
    adults?: number
    children?: number
    childrenAges?: number[]
  }): Promise<TourplanTour[]> {
    console.log("searchTours called with params:", params)
    console.log("Tourplan config:", {
      hasBaseUrl: !!this.config.baseUrl,
      hasUsername: !!this.config.username,
      hasPassword: !!this.config.password,
      hasAgentId: !!this.config.agentId,
      baseUrl: this.config.baseUrl
    })
    
    const cacheKey = CacheManager.getTourCacheKey(
      params.country || "all",
      params.destination || "all",
      params.tourLevel || "all",
    )

    try {
      const cachedTours = await CacheManager.get<TourplanTour[]>(cacheKey)
      if (cachedTours) {
        console.log(`Returning ${cachedTours.length} cached tours`)
        return cachedTours
      }
    } catch (error) {
      console.warn("Cache get failed, proceeding without cache:", error)
    }

    try {
      const xmlBody = this.buildSearchXML(params)
      console.log("Sending Tourplan OptionInfo Search request...")
      console.log("XML Request:", xmlBody)
      
      const xmlResponse = await this.makeRequest(xmlBody, false)
      console.log("Tourplan OptionInfo Search response received")
      console.log("XML Response:", JSON.stringify(xmlResponse, null, 2))
      
      const tours = this.parseTourData(xmlResponse)
      console.log(`Parsed ${tours.length} tours from Tourplan API`)

      // If we got real data from Tourplan, use it regardless of count
      if (tours.length > 0) {
        console.log(`Successfully retrieved ${tours.length} tours from Tourplan API`)
        
        // Try to cache the results
        try {
          await CacheManager.set(cacheKey, tours, 300)
          console.log("Tours cached successfully")
        } catch (error) {
          console.warn("Cache set failed, continuing without caching:", error)
        }

        return tours
      }

      // If no tours found, try different search strategies
      console.log("No tours found with current search, trying broader search...")
      
      // Try a broader search with just destination
      if (params.destination) {
        const broaderParams = {
          destination: params.destination,
          startDate: params.startDate || "2025-07-01",
          adults: params.adults || 2
        }
        
        const broaderXml = this.buildSearchXML(broaderParams)
        console.log("Trying broader search with destination only...")
        
        const broaderResponse = await this.makeRequest(broaderXml, false)
        const broaderTours = this.parseTourData(broaderResponse)
        
        if (broaderTours.length > 0) {
          console.log(`Found ${broaderTours.length} tours with broader search`)
          
          try {
            await CacheManager.set(cacheKey, broaderTours, 300)
          } catch (error) {
            console.warn("Cache set failed for broader search:", error)
          }
          
          return broaderTours
        }
      }

      // If still no results, fall back to mock data but log it clearly
      console.log("No tours found even with broader search, using mock data as fallback")
      const mockTours = this.getMockTours(params)
      console.log(`Returning ${mockTours.length} mock tours as fallback`)
      return mockTours

    } catch (error) {
      console.error("Tourplan API request failed:", error)
      console.log("Falling back to mock data due to API error")
      const mockTours = this.getMockTours(params)
      console.log(`Returning ${mockTours.length} mock tours due to error`)
      return mockTours
    }
  }

  private getMockTours(params: {
    country?: string
    destination?: string
    tourLevel?: string
    startDate?: string
    endDate?: string
    adults?: number
    children?: number
    childrenAges?: number[]
  }): TourplanTour[] {
    const mockTours: TourplanTour[] = [
      {
        tourId: "tour-001",
        tourName: "Kruger National Park Safari",
        description:
          "Experience the Big Five in South Africa's premier game reserve. This 3-day safari includes game drives, accommodation, and all meals.",
        duration: 3,
        priceFrom: 1200,
        currency: "USD",
        tourLevel: "standard",
        supplierId: "supplier-001",
        supplierName: "African Safari Co",
        destination: "Kruger National Park",
        country: "South Africa",
        availability: "OK",
        extras: [
          {
            extraId: "extra-001",
            extraName: "Bush Walk",
            description: "Guided walking safari with experienced ranger",
            price: 150,
            currency: "USD",
            isCompulsory: false,
            isPerPerson: true,
          },
          {
            extraId: "extra-002",
            extraName: "Park Fees",
            description: "Conservation fees (required)",
            price: 50,
            currency: "USD",
            isCompulsory: true,
            isPerPerson: true,
          },
        ],
      },
      {
        tourId: "tour-002",
        tourName: "Serengeti Migration Experience",
        description: "Witness the Great Migration in Tanzania's Serengeti. 5-day luxury safari with premium lodges.",
        duration: 5,
        priceFrom: 2800,
        currency: "USD",
        tourLevel: "luxury",
        supplierId: "supplier-002",
        supplierName: "Tanzania Adventures",
        destination: "Serengeti",
        country: "Tanzania",
        availability: "OK",
        extras: [
          {
            extraId: "extra-003",
            extraName: "Hot Air Balloon",
            description: "Sunrise balloon safari over the Serengeti",
            price: 450,
            currency: "USD",
            isCompulsory: false,
            isPerPerson: true,
          },
        ],
      },
      {
        tourId: "tour-003",
        tourName: "Gorilla Trekking Rwanda",
        description:
          "Once-in-a-lifetime mountain gorilla encounter in Volcanoes National Park. Includes permits and accommodation.",
        duration: 2,
        priceFrom: 1800,
        currency: "USD",
        tourLevel: "standard",
        supplierId: "supplier-003",
        supplierName: "Rwanda Eco Tours",
        destination: "Volcanoes National Park",
        country: "Rwanda",
        availability: "RQ",
        extras: [
          {
            extraId: "extra-004",
            extraName: "Gorilla Permit",
            description: "Required permit for gorilla trekking",
            price: 700,
            currency: "USD",
            isCompulsory: true,
            isPerPerson: true,
          },
        ],
      },
      {
        tourId: "tour-004",
        tourName: "Cape Town & Wine Country",
        description: "Explore Cape Town's highlights and visit world-famous wine regions. Cultural and scenic tour.",
        duration: 4,
        priceFrom: 950,
        currency: "USD",
        tourLevel: "basic",
        supplierId: "supplier-004",
        supplierName: "Cape Adventures",
        destination: "Cape Town",
        country: "South Africa",
        availability: "OK",
        extras: [
          {
            extraId: "extra-005",
            extraName: "Wine Tasting",
            description: "Premium wine tasting experience",
            price: 80,
            currency: "USD",
            isCompulsory: false,
            isPerPerson: true,
          },
        ],
      },
      {
        tourId: "tour-005",
        tourName: "Okavango Delta Mokoro Safari",
        description: "Traditional dugout canoe safari through the pristine Okavango Delta wetlands.",
        duration: 3,
        priceFrom: 1400,
        currency: "USD",
        tourLevel: "standard",
        supplierId: "supplier-005",
        supplierName: "Botswana Wilderness",
        destination: "Okavango Delta",
        country: "Botswana",
        availability: "OK",
        extras: [],
      },
    ]

    // Filter tours based on search criteria
    let filteredTours = mockTours

    // Only apply filters if search parameters are provided and not empty
    if (params.country && params.country.trim() !== '') {
      filteredTours = filteredTours.filter((tour) => tour.country.toLowerCase().includes(params.country!.toLowerCase()))
    }

    if (params.destination && params.destination.trim() !== '') {
      filteredTours = filteredTours.filter((tour) =>
        tour.destination.toLowerCase().includes(params.destination!.toLowerCase()),
      )
    }

    if (params.tourLevel && params.tourLevel.trim() !== '') {
      filteredTours = filteredTours.filter((tour) => tour.tourLevel === params.tourLevel)
    }

    console.log(`Mock tours filtering: ${filteredTours.length} tours found with params:`, params)
    return filteredTours
  }

  // Other methods remain the same but with error handling...
  async createBooking(bookingRequest: TourplanBookingRequest): Promise<TourplanBookingResponse> {
    // Mock implementation for now
    return {
      bookingId: `booking-${Date.now()}`,
      bookingReference: `TIA${Date.now().toString().slice(-6)}`,
      status: "confirmed",
      totalPrice: 1200,
      currency: "USD",
    }
  }

  async updatePaymentStatus(paymentUpdate: PaymentStatusUpdate): Promise<boolean> {
    // Mock implementation
    return true
  }

  async updateCustomerDetails(bookingId: string, customerDetails: any): Promise<boolean> {
    // Mock implementation
    return true
  }

  async getBookingDetails(bookingId: string): Promise<any> {
    // Mock implementation
    return {}
  }
}

let tourplanAPI: TourplanAPI | null = null

export function getTourplanAPI(): TourplanAPI {
  if (!tourplanAPI) {
    const config: TourplanConfig = {
      baseUrl: process.env.TOURPLAN_API_URL || "https://pa-thisis.nx.tourplan.net/hostconnect_test/api/hostConnectApi",
      soapSearchUrl: process.env.TOURPLAN_SOAP_SEARCH_URL || "https://pa-thisis.nx.tourplan.net/hostconnect_test/api/hostConnectApi",
      username: process.env.TOURPLAN_USERNAME || "SAMAGT",
      password: process.env.TOURPLAN_PASSWORD || "S@MAgt01",
      agentId: process.env.TOURPLAN_AGENT_ID || "SAMAGT",
    }
    tourplanAPI = new TourplanAPI(config)
  }
  return tourplanAPI
}
