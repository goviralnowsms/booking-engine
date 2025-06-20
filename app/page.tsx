"use client"

import { useState, useEffect } from "react"
import { SearchForm } from "@/components/search-form"
import { TourResults } from "@/components/tour-results"
import { BookingForm } from "@/components/booking-form"
import { PaymentForm } from "@/components/payment-form"
import { BookingConfirmation } from "@/components/booking-confirmation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@supabase/supabase-js"

export type BookingStep = "search" | "results" | "booking" | "payment" | "confirmation"

export interface SearchCriteria {
  country?: string
  destination?: string
  tourLevel?: string
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
  const [dbStatus, setDbStatus] = useState<string>("Checking database...")

  useEffect(() => {
    const testDatabase = async () => {
      try {
        // Check if environment variables exist
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          setDbStatus("❌ Supabase environment variables not found")
          return
        }

        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data, error } = await supabase.from("customers").select("count").limit(1)

        if (error) {
          setDbStatus(`❌ Database Error: ${error.message}`)
        } else {
          setDbStatus("✅ Database Connected Successfully")
        }
      } catch (err) {
        setDbStatus(`❌ Connection Error: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }

    testDatabase()
  }, [])

  const handleSearch = (criteria: SearchCriteria) => {
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

      <div className="container mx-auto px-4 py-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">{dbStatus}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {currentStep === "search" && <SearchForm onSearch={handleSearch} />}

        {currentStep === "results" && searchCriteria && (
          <TourResults
            searchCriteria={searchCriteria}
            onTourSelect={handleTourSelect}
            onBackToSearch={handleBackToSearch}
          />
        )}

        {currentStep === "booking" && selectedTour && (
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
