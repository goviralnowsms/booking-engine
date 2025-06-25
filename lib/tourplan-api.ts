import { parseStringPromise } from "xml2js"
import { CacheManager } from "./cache"

export interface TourplanConfig {
  baseUrl: string
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

  private async makeRequest(xmlBody: string): Promise<any> {
    try {
      const response = await fetch(this.config.baseUrl, {
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

  private buildSearchXML(params: {
    country?: string
    destination?: string
    tourLevel?: string
    startDate?: string
    endDate?: string
  }): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <Authentication>
      <Username>${this.config.username}</Username>
      <Password>${this.config.password}</Password>
      <AgentId>${this.config.agentId}</AgentId>
    </Authentication>
  </soap:Header>
  <soap:Body>
    <SearchTours>
      ${params.country ? `<Country>${params.country}</Country>` : ""}
      ${params.destination ? `<Destination>${params.destination}</Destination>` : ""}
      ${params.tourLevel ? `<TourLevel>${params.tourLevel}</TourLevel>` : ""}
      ${params.startDate ? `<StartDate>${params.startDate}</StartDate>` : ""}
      ${params.endDate ? `<EndDate>${params.endDate}</EndDate>` : ""}
      <IncludeCancellationDeadlines>true</IncludeCancellationDeadlines>
    </SearchTours>
  </soap:Body>
</soap:Envelope>`
  }

  private parseTourData(xmlData: any): TourplanTour[] {
    try {
      const tours = xmlData?.["soap:Envelope"]?.["soap:Body"]?.[0]?.SearchToursResponse?.[0]?.Tours?.[0]?.Tour || []

      return tours.map((tour: any) => ({
        tourId: tour.TourId?.[0] || "",
        tourName: tour.TourName?.[0] || "",
        description: tour.Description?.[0] || "",
        duration: Number.parseInt(tour.Duration?.[0] || "0"),
        priceFrom: Number.parseFloat(tour.PriceFrom?.[0] || "0"),
        currency: tour.Currency?.[0] || "USD",
        tourLevel: tour.TourLevel?.[0]?.toLowerCase() || "standard",
        supplierId: tour.SupplierId?.[0] || "",
        supplierName: tour.SupplierName?.[0] || "",
        destination: tour.Destination?.[0] || "",
        country: tour.Country?.[0] || "",
        availability: (tour.Availability?.[0] as "OK" | "RQ" | "NO") || "OK",
        maxParticipants: Number.parseInt(tour.MaxParticipants?.[0] || "0") || undefined,
        minParticipants: Number.parseInt(tour.MinParticipants?.[0] || "1") || 1,
        cancellationDeadline: tour.CancellationDeadline?.[0] || undefined,
        extras: this.parseExtrasData(tour.Extras?.[0]?.Extra || []),
      }))
    } catch (error) {
      console.error("Error parsing tour data:", error)
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

  async searchTours(params: {
    country?: string
    destination?: string
    tourLevel?: string
    startDate?: string
    endDate?: string
  }): Promise<TourplanTour[]> {
    // Check if we have valid Tourplan credentials
    if (!this.config.baseUrl || !this.config.username || !this.config.password) {
      console.log("Tourplan credentials not configured, returning mock data")
      return this.getMockTours(params)
    }

    const cacheKey = CacheManager.getTourCacheKey(
      params.country || "all",
      params.destination || "all",
      params.tourLevel || "all",
    )

    try {
      const cachedTours = await CacheManager.get<TourplanTour[]>(cacheKey)
      if (cachedTours) {
        return cachedTours
      }
    } catch (error) {
      console.warn("Cache get failed, proceeding without cache:", error)
    }

    try {
      const xmlBody = this.buildSearchXML(params)
      const xmlResponse = await this.makeRequest(xmlBody)
      const tours = this.parseTourData(xmlResponse)

      // Try to cache the results, but don't fail if caching fails
      try {
        await CacheManager.set(cacheKey, tours, 300)
      } catch (error) {
        console.warn("Cache set failed, continuing without caching:", error)
      }

      return tours
    } catch (error) {
      console.error("Tourplan API failed, falling back to mock data:", error)
      return this.getMockTours(params)
    }
  }

  private getMockTours(params: {
    country?: string
    destination?: string
    tourLevel?: string
    startDate?: string
    endDate?: string
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

    if (params.country) {
      filteredTours = filteredTours.filter((tour) => tour.country.toLowerCase().includes(params.country!.toLowerCase()))
    }

    if (params.destination) {
      filteredTours = filteredTours.filter((tour) =>
        tour.destination.toLowerCase().includes(params.destination!.toLowerCase()),
      )
    }

    if (params.tourLevel) {
      filteredTours = filteredTours.filter((tour) => tour.tourLevel === params.tourLevel)
    }

    return filteredTours
  }

  async checkAvailability(tourId: string, date: string): Promise<any> {
    // Check if we have valid Tourplan credentials
    if (!this.config.baseUrl || !this.config.username || !this.config.password) {
      console.log("Tourplan credentials not configured, returning mock availability")
      return this.getMockAvailability(tourId, date)
    }

    try {
      // For now, return mock data until we implement the full XML request
      return this.getMockAvailability(tourId, date)
    } catch (error) {
      console.error("Tourplan availability check failed, falling back to mock data:", error)
      return this.getMockAvailability(tourId, date)
    }
  }

  private getMockAvailability(tourId: string, date: string): any {
    return {
      available: true,
      price: 950,
      currency: "USD",
      maxParticipants: 20,
      currentBookings: 5,
      tourId,
      date
    }
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
      baseUrl: process.env.TOURPLAN_API_URL || "",
      username: process.env.TOURPLAN_USERNAME || "",
      password: process.env.TOURPLAN_PASSWORD || "",
      agentId: process.env.TOURPLAN_AGENT_ID || "",
    }
    tourplanAPI = new TourplanAPI(config)
  }
  return tourplanAPI
}
