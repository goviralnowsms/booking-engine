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
  cancellationDeadline?: string // For automated payment reminders
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
  // Payment is handled separately on our website
  createAsProvisional?: boolean // Create booking without payment first
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

  private buildBookingXML(bookingRequest: TourplanBookingRequest): string {
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
    <CreateBooking>
      <TourId>${bookingRequest.tourId}</TourId>
      <StartDate>${bookingRequest.startDate}</StartDate>
      <EndDate>${bookingRequest.endDate}</EndDate>
      <Adults>${bookingRequest.adults}</Adults>
      <Children>${bookingRequest.children}</Children>
      <CreateAsProvisional>${bookingRequest.createAsProvisional || false}</CreateAsProvisional>
      <Customer>
        <FirstName>${bookingRequest.customerDetails.firstName}</FirstName>
        <LastName>${bookingRequest.customerDetails.lastName}</LastName>
        <Email>${bookingRequest.customerDetails.email}</Email>
        <Phone>${bookingRequest.customerDetails.phone}</Phone>
        <Address>${bookingRequest.customerDetails.address}</Address>
        <CreateNewPassengerRecord>true</CreateNewPassengerRecord>
      </Customer>
      <Extras>
        ${bookingRequest.selectedExtras.map((extraId) => `<ExtraId>${extraId}</ExtraId>`).join("")}
      </Extras>
    </CreateBooking>
  </soap:Body>
</soap:Envelope>`
  }

  private buildPaymentUpdateXML(paymentUpdate: PaymentStatusUpdate): string {
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
    <UpdatePaymentStatus>
      <BookingId>${paymentUpdate.bookingId}</BookingId>
      <PaymentType>${paymentUpdate.paymentType}</PaymentType>
      <Amount>${paymentUpdate.amount}</Amount>
      <Currency>${paymentUpdate.currency}</Currency>
      <PaymentReference>${paymentUpdate.paymentReference}</PaymentReference>
      <PaymentDate>${paymentUpdate.paymentDate}</PaymentDate>
      <PaymentMethod>${paymentUpdate.paymentMethod}</PaymentMethod>
    </UpdatePaymentStatus>
  </soap:Body>
</soap:Envelope>`
  }

  private buildCustomerUpdateXML(bookingId: string, customerDetails: any): string {
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
    <UpdateCustomerDetails>
      <BookingId>${bookingId}</BookingId>
      <Customer>
        <FirstName>${customerDetails.firstName}</FirstName>
        <LastName>${customerDetails.lastName}</LastName>
        <Email>${customerDetails.email}</Email>
        <Phone>${customerDetails.phone}</Phone>
        <Address>${customerDetails.address}</Address>
        <CreateNewPassengerRecord>true</CreateNewPassengerRecord>
      </Customer>
    </UpdateCustomerDetails>
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

  private parseBookingResponse(xmlData: any): TourplanBookingResponse {
    try {
      const booking = xmlData?.["soap:Envelope"]?.["soap:Body"]?.[0]?.CreateBookingResponse?.[0]

      return {
        bookingId: booking.BookingId?.[0] || "",
        bookingReference: booking.BookingReference?.[0] || "",
        status: (booking.Status?.[0] as "confirmed" | "pending" | "failed") || "failed",
        totalPrice: Number.parseFloat(booking.TotalPrice?.[0] || "0"),
        currency: booking.Currency?.[0] || "USD",
        cancellationDeadline: booking.CancellationDeadline?.[0] || undefined,
        confirmationDetails: booking.ConfirmationDetails?.[0] || null,
      }
    } catch (error) {
      console.error("Error parsing booking response:", error)
      throw new Error("Failed to parse booking response")
    }
  }

  async searchTours(params: {
    country?: string
    destination?: string
    tourLevel?: string
    startDate?: string
    endDate?: string
  }): Promise<TourplanTour[]> {
    const cacheKey = CacheManager.getTourCacheKey(
      params.country || "all",
      params.destination || "all",
      params.tourLevel || "all",
    )

    const cachedTours = await CacheManager.get<TourplanTour[]>(cacheKey)
    if (cachedTours) {
      return cachedTours
    }

    const xmlBody = this.buildSearchXML(params)
    const xmlResponse = await this.makeRequest(xmlBody)
    const tours = this.parseTourData(xmlResponse)

    await CacheManager.set(cacheKey, tours, 300)
    return tours
  }

  async createBooking(bookingRequest: TourplanBookingRequest): Promise<TourplanBookingResponse> {
    // Create booking as provisional first (without payment)
    const provisionalRequest = { ...bookingRequest, createAsProvisional: true }
    const xmlBody = this.buildBookingXML(provisionalRequest)
    const xmlResponse = await this.makeRequest(xmlBody)
    return this.parseBookingResponse(xmlResponse)
  }

  async updatePaymentStatus(paymentUpdate: PaymentStatusUpdate): Promise<boolean> {
    try {
      const xmlBody = this.buildPaymentUpdateXML(paymentUpdate)
      const xmlResponse = await this.makeRequest(xmlBody)

      // Parse response to check if update was successful
      const success =
        xmlResponse?.["soap:Envelope"]?.["soap:Body"]?.[0]?.UpdatePaymentStatusResponse?.[0]?.Success?.[0] === "true"
      return success
    } catch (error) {
      console.error("Failed to update payment status in Tourplan:", error)
      return false
    }
  }

  async updateCustomerDetails(bookingId: string, customerDetails: any): Promise<boolean> {
    try {
      const xmlBody = this.buildCustomerUpdateXML(bookingId, customerDetails)
      const xmlResponse = await this.makeRequest(xmlBody)

      const success =
        xmlResponse?.["soap:Envelope"]?.["soap:Body"]?.[0]?.UpdateCustomerDetailsResponse?.[0]?.Success?.[0] === "true"
      return success
    } catch (error) {
      console.error("Failed to update customer details in Tourplan:", error)
      return false
    }
  }

  async getBookingDetails(bookingId: string): Promise<any> {
    // Implementation for retrieving booking details from Tourplan
    const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <Authentication>
      <Username>${this.config.username}</Username>
      <Password>${this.config.password}</Password>
      <AgentId>${this.config.agentId}</AgentId>
    </Authentication>
  </soap:Header>
  <soap:Body>
    <GetBookingDetails>
      <BookingId>${bookingId}</BookingId>
    </GetBookingDetails>
  </soap:Body>
</soap:Envelope>`

    const xmlResponse = await this.makeRequest(xmlBody)
    return xmlResponse
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
