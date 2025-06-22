"use client"

import type React from "react"

import { useState, useEffect } from "react"

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
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const testDatabase = async () => {
      try {
        const response = await fetch("/api/test-db")
        const result = await response.json()
        setDbStatus(result.status)
      } catch (err) {
        setDbStatus(`❌ Connection Error: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }

    testDatabase()
  }, [])

  const handleSearch = async (criteria: SearchCriteria) => {
    setLoading(true)
    setSearchCriteria(criteria)

    try {
      const response = await fetch("/api/tours/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(criteria),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch tours")
      }

      const data = await response.json()
      setTours(data.tours || [])
    } catch (error) {
      console.error("Failed to fetch tours:", error)
      setTours([])
    } finally {
      setLoading(false)
      setCurrentStep("results")
    }
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
    setTours([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🌍</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">This is Africa</h1>
                <p className="text-sm text-gray-600">Book Your African Adventure</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">📞 +61 (0) 2 96649187</div>
          </div>
        </div>
      </header>

      {/* Database Status */}
      <div className="container mx-auto px-4 py-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">{dbStatus}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {currentStep === "search" && <SearchForm onSearch={handleSearch} />}

        {currentStep === "results" && (
          <TourResults
            tours={tours}
            loading={loading}
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 This is Africa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// Simple Search Form Component
function SearchForm({ onSearch }: { onSearch: (criteria: SearchCriteria) => void }) {
  const [country, setCountry] = useState("")
  const [destination, setDestination] = useState("")
  const [tourLevel, setTourLevel] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({
      country: country || undefined,
      destination: destination || undefined,
      tourLevel: tourLevel || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      adults: adults || 2,
      children: children || 0,
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Your African Adventure</h1>
        <p className="text-xl text-gray-600">Search and book authentic African tours - all fields are optional</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">🔍 Search Tours</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Any country</option>
                <option value="South Africa">South Africa</option>
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Uganda">Uganda</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Botswana">Botswana</option>
                <option value="Namibia">Namibia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kruger, Serengeti, Cape Town"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tour Level</label>
            <select
              value={tourLevel}
              onChange={(e) => setTourLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Any level</option>
              <option value="basic">Basic - Budget Friendly</option>
              <option value="standard">Standard - Comfortable</option>
              <option value="luxury">Luxury - Premium Experience</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <input
                type="number"
                min="1"
                max="10"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <input
                type="number"
                min="0"
                max="10"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium"
          >
            🔍 Search Tours
          </button>
        </form>
      </div>
    </div>
  )
}

// Simple Tour Results Component
function TourResults({
  tours,
  loading,
  onTourSelect,
  onBackToSearch,
}: {
  tours: Tour[]
  loading: boolean
  onTourSelect: (tour: Tour) => void
  onBackToSearch: () => void
}) {
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <button onClick={onBackToSearch} className="mb-6 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          ← Back to Search
        </button>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for tours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={onBackToSearch} className="mb-6 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
        ← Back to Search
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Tours</h2>
        <p className="text-gray-600">{tours.length} tours found</p>
      </div>

      {tours.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No tours found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria.</p>
          <button
            onClick={onBackToSearch}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Modify Search
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tours.map((tour) => (
            <div key={tour.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tour.name}</h3>
                  <p className="text-gray-600 mb-4">{tour.description}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span>⏱️ {tour.duration} days</span>
                    <span>📍 {tour.location}</span>
                    <span>🏢 {tour.supplier}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        tour.availability === "OK"
                          ? "bg-green-100 text-green-800"
                          : tour.availability === "RQ"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tour.availability === "OK"
                        ? "Available"
                        : tour.availability === "RQ"
                          ? "On Request"
                          : "Not Available"}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{tour.level}</span>
                  </div>
                </div>

                <div className="text-right ml-6">
                  <p className="text-sm text-gray-500">From</p>
                  <p className="text-2xl font-bold text-gray-900">${tour.price}</p>
                  <p className="text-sm text-gray-500 mb-4">per person</p>

                  <button
                    onClick={() => onTourSelect(tour)}
                    disabled={tour.availability === "NO"}
                    className={`px-6 py-2 rounded-md ${
                      tour.availability === "NO"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {tour.availability === "NO" ? "Not Available" : "Select Tour"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Placeholder components for other steps
function BookingForm({ tour, searchCriteria, onSubmit, onBack }: any) {
  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-6 px-4 py-2 border border-gray-300 rounded-md">
        ← Back to Results
      </button>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Booking: {tour.name}</h2>
        <p className="text-gray-600 mb-4">Booking form coming soon...</p>
        <button
          onClick={() =>
            onSubmit({
              tour,
              selectedExtras: [],
              customerDetails: {
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                phone: "",
                address: "",
              },
              totalPrice: tour.price * 2,
              depositAmount: Math.round(tour.price * 2 * 0.3),
            })
          }
          className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}

function PaymentForm({ bookingData, onPaymentComplete, onBack }: any) {
  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-6 px-4 py-2 border border-gray-300 rounded-md">
        ← Back to Booking
      </button>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Payment</h2>
        <p className="text-gray-600 mb-4">Payment form coming soon...</p>
        <p className="mb-4">Deposit: ${bookingData.depositAmount}</p>
        <button
          onClick={() => onPaymentComplete(`TIA${Date.now().toString().slice(-6)}`)}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Complete Payment
        </button>
      </div>
    </div>
  )
}

function BookingConfirmation({ bookingData, bookingReference, onNewSearch }: any) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold mb-4">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-4">Reference: {bookingReference}</p>
        <p className="text-gray-600 mb-6">Your African adventure is secured!</p>
        <button onClick={onNewSearch} className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
          Book Another Tour
        </button>
      </div>
    </div>
  )
}
