"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Calendar, MapPin, Users, Mail, Phone, CreditCard, Search } from "lucide-react"
import type { BookingData } from "@/app/page"

interface BookingConfirmationProps {
  bookingData: BookingData
  bookingReference: string
  onNewSearch: () => void
}

export function BookingConfirmation({ bookingData, bookingReference, onNewSearch }: BookingConfirmationProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-lg text-gray-600">Your African adventure is secured. We'll be in touch soon!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>
              Reference: <span className="font-mono font-bold">{bookingReference}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{bookingData.tour.name}</h3>
              <p className="text-gray-600">{bookingData.tour.description}</p>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                <span>{bookingData.tour.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                <span>{bookingData.tour.duration} days</span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Selected Extras</h4>
              {bookingData.selectedExtras.length > 0 ? (
                <div className="space-y-1">
                  {bookingData.selectedExtras.map((extraId) => {
                    const extra = bookingData.tour.extras.find((e) => e.id === extraId)
                    if (!extra) return null
                    return (
                      <div key={extraId} className="flex justify-between text-sm">
                        <span>{extra.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {extra.isCompulsory ? "Required" : "Optional"}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No extras selected</p>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Customer Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span>
                    {bookingData.customerDetails.firstName} {bookingData.customerDetails.lastName}
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{bookingData.customerDetails.email}</span>
                </div>
                {bookingData.customerDetails.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{bookingData.customerDetails.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>Your deposit has been processed successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Payment Successful</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Tour Price</span>
                <span>${bookingData.totalPrice}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Deposit Paid</span>
                <span>${bookingData.depositAmount}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Remaining Balance</span>
                <span>${bookingData.totalPrice - bookingData.depositAmount}</span>
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Confirmation email sent to {bookingData.customerDetails.email}</li>
                <li>• We'll verify availability with suppliers</li>
                <li>• Final balance due 2-4 weeks before departure</li>
                <li>• Detailed itinerary will be provided</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• All bookings are subject to supplier confirmation</li>
                <li>• Cancellation policy applies as per terms</li>
                <li>• Travel insurance is recommended</li>
                <li>• Contact us for any changes or questions</li>
              </ul>
            </div>

            <Button onClick={onNewSearch} className="w-full" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Book Another Tour
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
