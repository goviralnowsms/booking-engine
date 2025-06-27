"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Users, Mail, Phone } from "lucide-react"

export default function BookingConfirmation() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking_id")
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookingId) {
      // Simulate loading booking details
      setTimeout(() => {
        setBooking({
          id: bookingId,
          confirmation_number: "TIA123456",
          status: "confirmed",
          tour_name: "Sydney Harbour Bridge Climb",
          booking_date: "2024-07-15",
          total_amount: 299,
          currency: "AUD",
          customer: {
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com",
            phone: "+61 400 000 000",
          },
          number_of_adults: 1,
          number_of_children: 0,
        })
        setLoading(false)
      }, 1000)
    }
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your booking confirmation...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p>Booking not found</p>
            <Button onClick={() => (window.location.href = "/booking")} className="mt-4">
              Make New Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">Booking Confirmed!</CardTitle>
            <p className="text-gray-600">Your tour has been successfully booked</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-700">Confirmation Number</p>
              <p className="text-2xl font-bold text-green-800">{booking.confirmation_number}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Booking Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tour Date</p>
                    <p className="font-medium">{booking.booking_date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Passengers</p>
                    <p className="font-medium">
                      {booking.number_of_adults} Adult{booking.number_of_adults > 1 ? "s" : ""}
                      {booking.number_of_children > 0 &&
                        `, ${booking.number_of_children} Child${booking.number_of_children > 1 ? "ren" : ""}`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Tour</p>
                <p className="font-medium">{booking.tour_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-xl font-bold">
                  ${booking.total_amount} {booking.currency}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className="bg-green-500">{booking.status}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{booking.customer.email}</span>
                </div>
                {booking.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{booking.customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">What's Next?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• A confirmation email has been sent to {booking.customer.email}</li>
                <li>• You'll receive detailed tour information 24 hours before your tour</li>
                <li>• Please arrive 15 minutes before your scheduled tour time</li>
                <li>• Bring a valid photo ID and comfortable walking shoes</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => window.print()} variant="outline" className="flex-1">
                Print Confirmation
              </Button>
              <Button onClick={() => (window.location.href = "/booking")} className="flex-1">
                Book Another Tour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
