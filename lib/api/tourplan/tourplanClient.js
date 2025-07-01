/**
 * TourPlan API Client
 * Handles communication with the TourPlan API
 */

const axios = require("axios")
const MockSystem = require("../utils/mockSystem")
const { TOURPLAN_CONFIG, MOCK_CONFIG } = require("../config")
const { transformTourPlanResponse } = require("../utils/xmlUtils")
const { tourplanAPI } = require("../../tourplan-api")

class TourPlanApiClient {
  constructor() {
    this.apiUrl = TOURPLAN_CONFIG.API_URL
    this.agentId = TOURPLAN_CONFIG.AGENT_ID
    this.password = TOURPLAN_CONFIG.PASSWORD
    this.api = tourplanAPI

    // Create axios instance with specific configuration for XML
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        "Content-Type": "text/xml",
      },
      timeout: TOURPLAN_CONFIG.TIMEOUT,
    })

    // Set up mock system if enabled
    this.useMocks = MOCK_CONFIG.ENABLED
    if (this.useMocks) {
      this.mockSystem = new MockSystem()
    }
  }

  /**
   * Send a request to the TourPlan API
   * @param {string} xmlRequest - XML request body
   * @param {string} requestType - Type of request for mocking and transformation
   * @returns {Promise<any>} - API response
   */
  async sendRequest(xmlRequest, requestType) {
    // Extract request type for mocking if not provided
    if (!requestType) {
      const match = xmlRequest.match(/<(\w+)Request>/)
      requestType = match ? match[1] : "unknown"
    }

    // Check for mock response
    if (this.useMocks) {
      const mockResponse = this.mockSystem.getMockResponse(requestType)
      if (mockResponse) {
        await this.mockSystem.simulateDelay()

        // Transform the XML response if it's an XML string
        if (typeof mockResponse === "string" && mockResponse.includes("<?xml")) {
          return transformTourPlanResponse(mockResponse, requestType)
        }

        return mockResponse
      }
      console.log(`No mock found for ${requestType}, will make actual API call and save response`)
    }

    try {
      console.log("Sending request to:", this.apiUrl)
      console.log("Request type:", requestType)

      const response = await this.client.post("", xmlRequest)

      console.log("Response status:", response.status)

      // Save successful response as mock for future use
      if (this.useMocks) {
        this.mockSystem.saveMockResponse(requestType, xmlRequest, response.data)
      }

      // Transform the XML response
      return transformTourPlanResponse(response.data, requestType)
    } catch (error) {
      this.handleRequestError(error, requestType)
    }
  }

  /**
   * Handle API request errors
   * @param {Error} error - The error object
   * @param {string} requestType - The type of request that failed
   * @throws {Error} - Rethrows the error with additional context
   */
  handleRequestError(error, requestType) {
    let errorMessage = `TourPlan API Error (${requestType})`
    let statusCode = 500
    let responseData = null

    if (error.response) {
      // The request was made and the server responded with an error
      statusCode = error.response.status
      responseData = error.response.data
      errorMessage = `TourPlan API Error (${requestType}): Status ${statusCode}`

      // Try to extract more detailed error information from XML response
      if (typeof responseData === "string" && responseData.includes("<Error>")) {
        const errorMatch = responseData.match(/<Error>.*?<Code>(.*?)<\/Code>.*?<Message>(.*?)<\/Message>.*?<\/Error>/s)
        if (errorMatch) {
          errorMessage = `TourPlan API Error: ${errorMatch[2]} (${errorMatch[1]})`
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = `TourPlan API Error (${requestType}): No response received`
    } else {
      // Something happened in setting up the request
      errorMessage = `TourPlan API Error (${requestType}): ${error.message}`
    }

    console.error(errorMessage, error)

    // Create an enhanced error object
    const enhancedError = new Error(errorMessage)
    enhancedError.statusCode = statusCode
    enhancedError.responseData = responseData
    enhancedError.requestType = requestType
    enhancedError.originalError = error

    throw enhancedError
  }

  /**
   * Get service button details
   * @param {string} buttonName - Name of the button to get details for
   * @returns {Promise<Object>} - Button details
   */
  async getServiceButtonDetails(buttonName) {
    const xmlRequest = `<?xml version="1.0"?><!DOCTYPE Request SYSTEM "hostConnect_5_05_000.dtd">
  <Request>
    <GetServiceButtonDetailsRequest>
      <AgentID>${this.agentId}</AgentID>
      <Password>${this.password}</Password>
      <ButtonName>${buttonName}</ButtonName>
    </GetServiceButtonDetailsRequest>
  </Request>`

    return this.sendRequest(xmlRequest, "GetServiceButtonDetails")
  }

  /**
   * Search for tours
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.location - Location to search for
   * @param {string} searchParams.startDate - Start date in YYYY-MM-DD format
   * @param {string} searchParams.endDate - End date in YYYY-MM-DD format
   * @param {number} searchParams.adults - Number of adults
   * @param {number} searchParams.children - Number of children
   * @param {string} searchParams.serviceType - Type of service to search for
   * @returns {Promise<Object>} - Search results
   */
  async searchTours(searchParams) {
    try {
      // Create search XML request
      const xmlRequest = this.api.createOptionInfoRequest(
        searchParams.opt || "SAMAGT",
        "GS", // General Search
        searchParams.dateFrom,
        searchParams.dateTo,
        searchParams.roomConfigs,
      )

      const response = await this.api.makeRequest(xmlRequest)
      return this.parseResponse(response)
    } catch (error) {
      console.error("Tour search failed:", error)
      throw error
    }
  }

  /**
   * Check availability of tours
   * @param {Object} availabilityParams - Availability parameters
   * @param {string} availabilityParams.opt - Option code
   * @param {string} availabilityParams.dateFrom - Start date in YYYY-MM-DD format
   * @param {string} availabilityParams.dateTo - End date in YYYY-MM-DD format
   * @param {Array} availabilityParams.roomConfigs - Room configurations
   * @returns {Promise<Object>} - Availability results
   */
  async getAvailability(availabilityParams) {
    try {
      const xmlRequest = this.api.createOptionInfoRequest(
        availabilityParams.opt || "SAMAGT",
        "A", // Availability
        availabilityParams.dateFrom,
        availabilityParams.dateTo,
        availabilityParams.roomConfigs,
      )

      const response = await this.api.makeRequest(xmlRequest)
      return this.parseResponse(response)
    } catch (error) {
      console.error("Availability check failed:", error)
      throw error
    }
  }

  parseResponse(xmlResponse) {
    // Simple XML parsing - you might want to use xml2js here
    return {
      success: !xmlResponse.includes("Error"),
      data: xmlResponse,
      parsed: xmlResponse.includes("OptionInfoResponse"),
    }
  }

  /**
   * Get tour details
   * @param {string} tourId - ID of the tour to get details for
   * @returns {Promise<Object>} - Tour details
   */
  async getTourDetails(tourId) {
    if (!tourId) {
      throw new Error("Tour ID is required")
    }

    const xmlRequest = `<?xml version="1.0"?><!DOCTYPE Request SYSTEM "hostConnect_5_05_000.dtd">
  <Request>
    <GetTourDetailsRequest>
      <AgentID>${this.agentId}</AgentID>
      <Password>${this.password}</Password>
      <TourID>${tourId}</TourID>
    </GetTourDetailsRequest>
  </Request>`

    return this.sendRequest(xmlRequest, "GetTourDetails")
  }

  /**
   * Create a booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>} - Booking confirmation
   */
  async createBooking(bookingData) {
    const { tourId, startDate, endDate, adults = 1, children = 0, customerDetails } = bookingData

    // Validate required parameters
    if (!tourId || !startDate || !customerDetails) {
      throw new Error("Missing required booking parameters")
    }

    // Construct travelers XML based on customer details
    let travelersXml = ""
    if (customerDetails) {
      // Lead traveler
      travelersXml += `
      <Travellers>
        <Traveller>
          <Title>${customerDetails.title || "Mr"}</Title>
          <FirstName>${customerDetails.firstName}</FirstName>
          <LastName>${customerDetails.lastName}</LastName>
          <LeadTraveller>true</LeadTraveller>
          <DateOfBirth>${customerDetails.dateOfBirth || "1980-01-01"}</DateOfBirth>
          <Email>${customerDetails.email}</Email>
          <Phone>${customerDetails.phone}</Phone>
        </Traveller>`

      // Additional travelers if provided
      if (customerDetails.additionalTravelers && customerDetails.additionalTravelers.length > 0) {
        customerDetails.additionalTravelers.forEach((traveler) => {
          travelersXml += `
        <Traveller>
          <Title>${traveler.title || "Mr"}</Title>
          <FirstName>${traveler.firstName}</FirstName>
          <LastName>${traveler.lastName}</LastName>
          <LeadTraveller>false</LeadTraveller>
          <DateOfBirth>${traveler.dateOfBirth || "1980-01-01"}</DateOfBirth>
        </Traveller>`
        })
      }

      travelersXml += `
      </Travellers>`
    }

    const xmlRequest = `<?xml version="1.0"?><!DOCTYPE Request SYSTEM "hostConnect_5_05_000.dtd">
  <Request>
    <CreateBookingRequest>
      <AgentID>${this.agentId}</AgentID>
      <Password>${this.password}</Password>
      <CurrencyCode>AUD</CurrencyCode>
      <ClientReference>TIA-${Date.now().toString().slice(-6)}</ClientReference>
      <Services>
        <Service>
          <ServiceType>TOU</ServiceType>
          <ServiceID>${tourId}</ServiceID>
          <StartDate>${startDate}</StartDate>
          ${endDate ? `<EndDate>${endDate}</EndDate>` : ""}
          <Adults>${adults}</Adults>
          <Children>${children}</Children>
        </Service>
      </Services>${travelersXml}
    </CreateBookingRequest>
  </Request>`

    return this.sendRequest(xmlRequest, "CreateBooking")
  }

  /**
   * Initialize the mock system with sample data
   */
  createSampleMockData() {
    if (!this.useMocks || !this.mockSystem) return

    // Sample mock response for GetServiceButtonDetails
    const sampleButtonResponse = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <GetServiceButtonDetailsResponse>
      <ButtonName>Group Tours</ButtonName>
      <Description>Group Tours and Activities</Description>
      <ButtonText>Group Tours</ButtonText>
      <ButtonType>Tours</ButtonType>
      <Status>OK</Status>
    </GetServiceButtonDetailsResponse>
  </Response>`

    this.mockSystem.saveMockResponse("GetServiceButtonDetails", "Sample request", sampleButtonResponse)

    // Sample mock response for GetAvailability
    const sampleAvailabilityResponse = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <GetAvailabilityResponse>
      <Status>OK</Status>
      <Services>
        <Service>
          <ServiceId>12345</ServiceId>
          <ServiceName>Cape Town Safari Adventure</ServiceName>
          <ServiceType>TOU</ServiceType>
          <StartDate>2025-07-01</StartDate>
          <EndDate>2025-07-05</EndDate>
          <Duration>5</Duration>
          <Price>
            <Amount>1299.00</Amount>
            <Currency>AUD</Currency>
          </Price>
          <Availability>Available</Availability>
          <Description>Experience the best of Cape Town wildlife on this 5-day safari adventure.</Description>
        </Service>
        <Service>
          <ServiceId>12346</ServiceId>
          <ServiceName>Johannesburg Cultural Tour</ServiceName>
          <ServiceType>TOU</ServiceType>
          <StartDate>2025-07-02</StartDate>
          <EndDate>2025-07-04</EndDate>
          <Duration>3</Duration>
          <Price>
            <Amount>899.00</Amount>
            <Currency>AUD</Currency>
          </Price>
          <Availability>Available</Availability>
          <Description>Immerse yourself in the rich culture and history of Johannesburg.</Description>
        </Service>
      </Services>
    </GetAvailabilityResponse>
  </Response>`

    this.mockSystem.saveMockResponse("GetAvailability", "Sample availability request", sampleAvailabilityResponse)

    // Sample mock response for GetTourDetails
    const sampleTourDetailsResponse = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <GetTourDetailsResponse>
      <TourId>12345</TourId>
      <TourName>Cape Town Safari Adventure</TourName>
      <Description>Experience the best of Cape Town wildlife on this 5-day safari adventure. Includes luxury accommodations and expert guides.</Description>
      <Duration>5</Duration>
      <StartDate>2025-07-01</StartDate>
      <EndDate>2025-07-05</EndDate>
      <Price>
        <Amount>1299.00</Amount>
        <Currency>AUD</Currency>
      </Price>
      <Inclusions>
        <Inclusion>Luxury accommodations</Inclusion>
        <Inclusion>All meals</Inclusion>
        <Inclusion>Expert guide</Inclusion>
        <Inclusion>Transportation</Inclusion>
        <Inclusion>Safari activities</Inclusion>
      </Inclusions>
      <Itinerary>
        <Day>
          <DayNumber>1</DayNumber>
          <Description>Arrival in Cape Town, welcome dinner and orientation.</Description>
        </Day>
        <Day>
          <DayNumber>2</DayNumber>
          <Description>Morning safari drive, afternoon wildlife photography workshop.</Description>
        </Day>
        <Day>
          <DayNumber>3</DayNumber>
          <Description>Full day at Kruger National Park.</Description>
        </Day>
        <Day>
          <DayNumber>4</DayNumber>
          <Description>Visit to local conservation center, evening safari.</Description>
        </Day>
        <Day>
          <DayNumber>5</DayNumber>
          <Description>Final morning drive, departure.</Description>
        </Day>
      </Itinerary>
      <Status>OK</Status>
    </GetTourDetailsResponse>
  </Response>`

    this.mockSystem.saveMockResponse("GetTourDetails", "Sample tour details request", sampleTourDetailsResponse)

    // Sample mock response for CreateBooking
    const sampleBookingResponse = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <CreateBookingResponse>
      <Status>OK</Status>
      <BookingId>B12345678</BookingId>
      <Reference>TIA123456</Reference>
      <CreatedDate>2025-06-11</CreatedDate>
      <TotalAmount>
        <Amount>1299.00</Amount>
        <Currency>AUD</Currency>
      </TotalAmount>
      <DepositAmount>
        <Amount>259.80</Amount>
        <Currency>AUD</Currency>
      </DepositAmount>
    </CreateBookingResponse>
  </Response>`

    this.mockSystem.saveMockResponse("CreateBooking", "Sample booking request", sampleBookingResponse)

    console.log("Created sample TourPlan mock data")
  }
}

// Create a singleton instance
const tourplanClient = new TourPlanApiClient()

// Create sample mock data if using mocks
if (MOCK_CONFIG.ENABLED) {
  tourplanClient.createSampleMockData()
}

module.exports = tourplanClient
