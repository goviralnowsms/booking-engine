"use client"
import { useState, useEffect } from "react"
import { EnhancedSearchForm } from "@/components/enhanced-search-form"
import { TourResults } from "@/components/tour-results"
import { BookingForm } from "@/components/booking-form"
import { PaymentForm } from "@/components/payment-form"
import { BookingConfirmation } from "@/components/booking-confirmation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DemoBanner } from "@/components/demo-banner"

export type BookingStep = "search" | "results" | "booking" | "payment" | "confirmation"

export interface SearchCriteria {
  country?: string
  destination?: string
  tourLevel?: string
  tourType?: string
  duration?: string
  budget?: string
  startDate?: string
  endDate?: string
  adults?: number
  children?: number
}

export interface Tour {
  id: string
  name: string
  description: string
  duration: number
  price: number
  level: string
  availability: "OK" | "RQ" | "NO"
  supplier: string
  location: string
  extras: TourExtra[]
}

export interface TourExtra {
  id: string
  name: string
  description: string
  price: number
  isCompulsory: boolean
}

export interface BookingData {
  tour: Tour
  selectedExtras: string[]
  customerDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
  }
  totalPrice: number
  depositAmount: number
}

export default function BookingEngine() {
  const [currentStep, setCurrentStep] = useState<BookingStep>("search")
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [bookingReference, setBookingReference] = useState<string>("")
  const [dbStatus, setDbStatus] = useState<string>("Demo mode - using sample data")
  const [showDbStatus, setShowDbStatus] = useState(false)

  // Handle URL parameters for direct tour links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tourId = urlParams.get("tour")
    const country = urlParams.get("country")
    const destination = urlParams.get("destination")

    if (tourId || country || destination) {
      // Pre-populate search criteria from URL
      const criteria: SearchCriteria = {
        country: country || undefined,
        destination: destination || undefined,
      }

      if (Object.keys(criteria).some((key) => criteria[key as keyof SearchCriteria])) {
        setSearchCriteria(criteria)
        setCurrentStep("results")
      }
    }
  }, [])

  useEffect(() => {
    const testDatabase = async () => {
      try {
        const response = await fetch("/api/test-db")
        const result = await response.json()

        if (result.success) {
          setDbStatus("✅ Database connected successfully")
        } else {
          setDbStatus("Demo mode - using sample data (database setup pending)")
        }
      } catch (err) {
        setDbStatus("Demo mode - using sample data (database setup pending)")
      }
    }

    // Only test database in background, don't show errors prominently
    testDatabase()
  }, [])

  const handleSearch = async (criteria: SearchCriteria) => {
    setSearchCriteria(criteria)
    setCurrentStep("results")
  }

  const handleTourSelect = (tour: Tour) => {
    setSelectedTour(tour)
    setCurrentStep("booking")
  }

  const handleBookingSubmit = (booking: BookingData) => {
    setBookingData(booking)
    setCurrentStep("payment")
  }

  const handlePaymentComplete = (reference: string) => {
    setBookingReference(reference)
    setCurrentStep("confirmation")
  }

  const handleBackToSearch = () => {
    setCurrentStep("search")
    setSearchCriteria(null)
    setSelectedTour(null)
    setBookingData(null)
    setBookingReference("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Simplified Status - Only show if user wants to see it */}
      {showDbStatus && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <p className="text-sm text-blue-800">{dbStatus}</p>
            <button onClick={() => setShowDbStatus(false)} className="text-blue-600 hover:text-blue-800 text-sm">
              Hide
            </button>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <DemoBanner />

        {/* Optional: Add a small link to check database status */}
        {!showDbStatus && (
          <div className="text-center mb-4">
            <button
              onClick={() => setShowDbStatus(true)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Check system status
            </button>
          </div>
        )}

        {currentStep === "search" && <EnhancedSearchForm onSearch={handleSearch} />}

        {currentStep === "results" && searchCriteria && (
          <TourResults
            searchCriteria={searchCriteria}
            onTourSelect={handleTourSelect}
            onBackToSearch={handleBackToSearch}
          />
        )}

        {currentStep === "booking" && selectedTour && searchCriteria && (
          <BookingForm
            tour={selectedTour}
            searchCriteria={searchCriteria}
            onSubmit={handleBookingSubmit}
            onBack={() => setCurrentStep("results")}
          />
        )}

        {currentStep === "payment" && bookingData && (
          <PaymentForm
            bookingData={bookingData}
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setCurrentStep("booking")}
          />
        )}

        {currentStep === "confirmation" && bookingData && (
          <BookingConfirmation
            bookingData={bookingData}
            bookingReference={bookingReference}
            onNewSearch={handleBackToSearch}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
