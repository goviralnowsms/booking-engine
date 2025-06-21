"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const testDatabase = async () => {
      try {
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

  const handleSearch = async (criteria: SearchCriteria) => {
    setLoading(true)
    setSearchCriteria(criteria)

    // Mock tours data
    const mockTours: Tour[] = [
      {
        id: "tour-001",
        name: "Kruger National Park Safari",
        description:
          "Experience the Big Five in South Africa's premier game reserve. This 3-day safari includes game drives, accommodation, and all meals.",
        duration: 3,
        price: 1200,
        level: "standard",
        availability: "OK",
        supplier: "African Safari Co",
        location: "Kruger National Park, South Africa",
        extras: [
          {
            id: "extra-001",
            name: "Bush Walk",
            description: "Guided walking safari with experienced ranger",
            price: 150,
            isCompulsory: false,
          },
          {
            id: "extra-002",
            name: "Park Fees",
            description: "Conservation fees (required)",
            price: 50,
            isCompulsory: true,
          },
        ],
      },
      {
        id: "tour-002",
        name: "Serengeti Migration Experience",
        description: "Witness the Great Migration in Tanzania's Serengeti. 5-day luxury safari with premium lodges.",
        duration: 5,
        price: 2800,
        level: "luxury",
        availability: "OK",
        supplier: "Tanzania Adventures",
        location: "Serengeti, Tanzania",
        extras: [
          {
            id: "extra-003",
            name: "Hot Air Balloon",
            description: "Sunrise balloon safari over the Serengeti",
            price: 450,
            isCompulsory: false,
          },
        ],
      },
      {
        id: "tour-003",
        name: "Gorilla Trekking Rwanda",
        description:
          "Once-in-a-lifetime mountain gorilla encounter in Volcanoes National Park. Includes permits and accommodation.",
        duration: 2,
        price: 1800,
        level: "standard",
        availability: "RQ",
        supplier: "Rwanda Eco Tours",
        location: "Volcanoes National Park, Rwanda",
        extras: [
          {
            id: "extra-004",
            name: "Gorilla Permit",
            description: "Required permit for gorilla trekking",
            price: 700,
            isCompulsory: true,
          },
        ],
      },
    ]

    // Filter tours based on criteria
    let filteredTours = mockTours

    if (criteria.country) {
      filteredTours = filteredTours.filter((tour) =>
        tour.location.toLowerCase().includes(criteria.country!.toLowerCase()),
      )
    }

    if (criteria.destination) {
      filteredTours = filteredTours.filter((tour) =>
        tour.location.toLowerCase().includes(criteria.destination!.toLowerCase()),
      )
    }

    if (criteria.tourLevel) {
      filteredTours = filteredTours.filter((tour) => tour.level === criteria.tourLevel)
    }

    setTours(filteredTours)
    setLoading(false)
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
  const [tourLevel, setTourLevel] = useState("")
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({
      country: country || undefined,
      tourLevel: tourLevel || undefined,
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
                className="w-full p-2 border border-gray-300 rounded-md"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Tour Level</label>
              <select
                value={tourLevel}
                onChange={(e) => setTourLevel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Any level</option>
                <option value="basic">Basic - Budget Friendly</option>
                <option value="standard">Standard - Comfortable</option>
                <option value="luxury">Luxury - Premium Experience</option>
              </select>
            </div>
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
                className="w-full p-2 border border-gray-300 rounded-md"
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
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
          <button onClick={onBackToSearch} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
                        : "bg-blue-600 text-white hover:bg-blue-700"
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
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
        <button onClick={onNewSearch} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Book Another Tour
        </button>
      </div>
    </div>
  )
}
