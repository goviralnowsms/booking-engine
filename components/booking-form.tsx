"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Users, Clock } from "lucide-react"
import type { SearchCriteria, Tour, BookingData } from "@/app/page"

interface BookingFormProps {
  tour: Tour
  searchCriteria: SearchCriteria
  onSubmit: (booking: BookingData) => void
  onBack: () => void
}

export function BookingForm({ tour, searchCriteria, onSubmit, onBack }: BookingFormProps) {
  const [selectedExtras, setSelectedExtras] = useState<string[]>(
    tour.extras.filter((extra) => extra.isCompulsory).map((extra) => extra.id),
  )
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  })

  const handleExtraToggle = (extraId: string, isCompulsory: boolean) => {
    if (isCompulsory) return

    setSelectedExtras((prev) => (prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]))
  }

  const calculateTotal = () => {
    const adults = searchCriteria.adults || 2
    const children = searchCriteria.children || 0
    const basePrice = tour.price * (adults + children)
    const extrasPrice = selectedExtras.reduce((total, extraId) => {
      const extra = tour.extras.find((e) => e.id === extraId)
      return total + (extra ? extra.price * (adults + children) : 0)
    }, 0)
    return basePrice + extrasPrice
  }

  const totalPrice = calculateTotal()
  const depositAmount = Math.round(totalPrice * 0.3)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerDetails.firstName || !customerDetails.lastName || !customerDetails.email) {
      alert("Please fill in all required fields")
      return
    }

    const bookingData: BookingData = {
      tour,
      selectedExtras,
      customerDetails,
      totalPrice,
      depositAmount,
    }

    onSubmit(bookingData)
  }

  const adults = searchCriteria.adults || 2
  const children = searchCriteria.children || 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tour Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{tour.name}</h3>
                  <p className="text-gray-600">{tour.description}</p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {searchCriteria.startDate} to {searchCriteria.endDate}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {tour.duration} days
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {adults} adults, {children} children
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Extras</CardTitle>
              <CardDescription>Enhance your tour with additional experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tour.extras.map((extra) => (
                  <div key={extra.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedExtras.includes(extra.id)}
                      onCheckedChange={() => handleExtraToggle(extra.id, extra.isCompulsory)}
                      disabled={extra.isCompulsory}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{extra.name}</h4>
                        {extra.isCompulsory && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{extra.description}</p>
                      <p className="text-sm font-medium text-green-600">+${extra.price} per person</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Please provide your contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerDetails.firstName}
                      onChange={(e) =>
                        setCustomerDetails((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerDetails.lastName}
                      onChange={(e) =>
                        setCustomerDetails((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) =>
                      setCustomerDetails((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) =>
                      setCustomerDetails((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={customerDetails.address}
                    onChange={(e) =>
                      setCustomerDetails((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">{tour.name}</h4>
                <p className="text-sm text-gray-600">{tour.level} level</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base price ({adults + children} people)</span>
                  <span>${tour.price * (adults + children)}</span>
                </div>

                {selectedExtras.map((extraId) => {
                  const extra = tour.extras.find((e) => e.id === extraId)
                  if (!extra) return null
                  return (
                    <div key={extraId} className="flex justify-between text-sm">
                      <span>{extra.name}</span>
                      <span>+${extra.price * (adults + children)}</span>
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Total Price</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Deposit Required (30%)</span>
                  <span>${depositAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Remaining Balance</span>
                  <span>${totalPrice - depositAmount}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                size="lg"
                disabled={!customerDetails.firstName || !customerDetails.lastName || !customerDetails.email}
              >
                Proceed to Payment
              </Button>

              <p className="text-xs text-gray-500 text-center">
                You will only be charged the deposit amount today. The remaining balance is due 2-4 weeks before
                departure.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
