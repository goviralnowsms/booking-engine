"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, CreditCard, Loader2 } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Tour {
  id: string
  name: string
  description: string
  duration_days: number
  base_price: number
  currency: string
  supplier_name: string
}

interface BookingData {
  tour_id: string
  booking_date: string
  number_of_adults: number
  number_of_children: number
  customer: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  special_requirements: string
  total_amount: number
}

function BookingForm() {
  const [tours, setTours] = useState<Tour[]>([])
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [bookingData, setBookingData] = useState<BookingData>({
    tour_id: "",
    booking_date: "",
    number_of_adults: 1,
    number_of_children: 0,
    customer: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    },
    special_requirements: "",
    total_amount: 0,
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Tour Selection, 2: Details, 3: Payment
  const [clientSecret, setClientSecret] = useState("")

  // Load tours on component mount
  useEffect(() => {
    loadTours()
  }, [])

  // Calculate total when tour or passenger count changes
  useEffect(() => {
    if (selectedTour) {
      const total = selectedTour.base_price * (bookingData.number_of_adults + bookingData.number_of_children * 0.7) // Children 70% price
      setBookingData((prev) => ({ ...prev, total_amount: total }))
    }
  }, [selectedTour, bookingData.number_of_adults, bookingData.number_of_children])

  const loadTours = async () => {
    try {
      const response = await fetch("/api/tours")
      const data = await response.json()
      if (data.success) {
        setTours(data.tours)
      }
    } catch (error) {
      console.error("Failed to load tours:", error)
    }
  }

  const handleTourSelect = (tourId: string) => {
    const tour = tours.find((t) => t.id === tourId)
    setSelectedTour(tour || null)
    setBookingData((prev) => ({ ...prev, tour_id: tourId }))
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("customer.")) {
      const customerField = field.split(".")[1]
      setBookingData((prev) => ({
        ...prev,
        customer: { ...prev.customer, [customerField]: value },
      }))
    } else {
      setBookingData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const proceedToPayment = async () => {
    setLoading(true)
    try {
      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(bookingData.total_amount * 100), // Convert to cents
          currency: selectedTour?.currency.toLowerCase() || "aud",
          booking_data: bookingData,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setClientSecret(data.client_secret)
        setStep(3)
      } else {
        alert(`Payment setup failed: ${data.error}`)
      }
    } catch (error) {
      alert(`Error: ${error}`)
    }
    setLoading(false)
  }

  const isStep1Valid = selectedTour && bookingData.booking_date
  const isStep2Valid =
    bookingData.customer.first_name &&
    bookingData.customer.last_name &&
    bookingData.customer.email &&
    bookingData.number_of_adults > 0

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Book Your Tour</CardTitle>
          <CardDescription>Complete your booking in 3 easy steps</CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant={step >= 1 ? "default" : "secondary"}>1. Select Tour</Badge>
            <Badge variant={step >= 2 ? "default" : "secondary"}>2. Your Details</Badge>
            <Badge variant={step >= 3 ? "default" : "secondary"}>3. Payment</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Tour Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Your Tour</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Choose Tour</Label>
                  <Select onValueChange={handleTourSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tour" />
                    </SelectTrigger>
                    <SelectContent>
                      {tours.map((tour) => (
                        <SelectItem key={tour.id} value={tour.id}>
                          {tour.name} - ${tour.base_price} {tour.currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Booking Date</Label>
                  <Input
                    type="date"
                    value={bookingData.booking_date}
                    onChange={(e) => handleInputChange("booking_date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <Select
                    value={bookingData.number_of_adults.toString()}
                    onValueChange={(value) => handleInputChange("number_of_adults", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Adult{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Children</Label>
                  <Select
                    value={bookingData.number_of_children.toString()}
                    onValueChange={(value) => handleInputChange("number_of_children", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Child{num !== 1 ? "ren" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTour && (
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{selectedTour.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{selectedTour.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {selectedTour.duration_days} days
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />${selectedTour.base_price} {selectedTour.currency}
                      </span>
                    </div>
                    {bookingData.total_amount > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="font-semibold">
                          Total: ${bookingData.total_amount.toFixed(2)} {selectedTour.currency}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button onClick={() => setStep(2)} disabled={!isStep1Valid} className="w-full">
                Continue to Details
              </Button>
            </div>
          )}

          {/* Step 2: Customer Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Details</h3>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={bookingData.customer.first_name}
                    onChange={(e) => handleInputChange("customer.first_name", e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={bookingData.customer.last_name}
                    onChange={(e) => handleInputChange("customer.last_name", e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={bookingData.customer.email}
                    onChange={(e) => handleInputChange("customer.email", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={bookingData.customer.phone}
                    onChange={(e) => handleInputChange("customer.phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Requirements</Label>
                <Textarea
                  value={bookingData.special_requirements}
                  onChange={(e) => handleInputChange("special_requirements", e.target.value)}
                  placeholder="Any dietary requirements, accessibility needs, or special requests..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Tour:</span>
                    <span>{selectedTour?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{bookingData.booking_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span>
                      {bookingData.number_of_adults} Adult{bookingData.number_of_adults > 1 ? "s" : ""}
                      {bookingData.number_of_children > 0 &&
                        `, ${bookingData.number_of_children} Child${bookingData.number_of_children > 1 ? "ren" : ""}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>
                      ${bookingData.total_amount.toFixed(2)} {selectedTour?.currency}
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={proceedToPayment} disabled={!isStep2Valid || loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                Proceed to Payment
              </Button>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && clientSecret && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Payment</h3>
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm bookingData={bookingData} selectedTour={selectedTour} />
              </Elements>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PaymentForm({ bookingData, selectedTour }: { bookingData: BookingData; selectedTour: Tour | null }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError("")

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError("Card element not found")
      setLoading(false)
      return
    }

    // Confirm payment
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(bookingData.client_secret || "", {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${bookingData.customer.first_name} ${bookingData.customer.last_name}`,
          email: bookingData.customer.email,
          phone: bookingData.customer.phone,
        },
      },
    })

    if (stripeError) {
      setError(stripeError.message || "Payment failed")
      setLoading(false)
    } else if (paymentIntent?.status === "succeeded") {
      // Payment successful - create booking
      try {
        const response = await fetch("/api/create-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bookingData,
            payment_intent_id: paymentIntent.id,
            payment_status: "paid",
          }),
        })

        const result = await response.json()
        if (result.success) {
          // Redirect to confirmation page
          window.location.href = `/booking/confirmation?booking_id=${result.booking.id}`
        } else {
          setError(`Booking creation failed: ${result.error}`)
        }
      } catch (bookingError) {
        setError(`Booking creation failed: ${bookingError}`)
      }
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">🧪 Test Mode Active</h4>
        <p className="text-sm text-yellow-700 mb-2">Use these test card numbers:</p>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            <strong>Success:</strong> 4242 4242 4242 4242
          </li>
          <li>
            <strong>Declined:</strong> 4000 0000 0000 0002
          </li>
          <li>
            <strong>Expiry:</strong> Any future date (e.g., 12/25)
          </li>
          <li>
            <strong>CVC:</strong> Any 3 digits (e.g., 123)
          </li>
        </ul>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Payment Summary</h4>
        <div className="flex justify-between items-center">
          <span>Total Amount:</span>
          <span className="text-xl font-bold">
            ${bookingData.total_amount.toFixed(2)} {selectedTour?.currency}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="border rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${bookingData.total_amount.toFixed(2)} {selectedTour?.currency}
          </>
        )}
      </Button>
    </form>
  )
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BookingForm />
    </div>
  )
}
