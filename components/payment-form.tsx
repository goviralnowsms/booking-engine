"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Lock, Shield } from "lucide-react"
import type { BookingData } from "@/app/page"

interface PaymentFormProps {
  bookingData: BookingData
  onPaymentComplete: (reference: string) => void
  onBack: () => void
}

export function PaymentForm({ bookingData, onPaymentComplete, onBack }: PaymentFormProps) {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  })
  const [billingAddress, setBillingAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  })
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate billing address
    if (!billingAddress.street || !billingAddress.city || !billingAddress.state ||
        !billingAddress.postalCode || !billingAddress.country) {
      alert("Please fill in all required billing address fields")
      return
    }
    
    setProcessing(true)

    // Here you would typically send the billing address along with payment details
    // to your payment processor
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const reference = `TIA${Date.now().toString().slice(-6)}`

    setProcessing(false)
    onPaymentComplete(reference)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setPaymentDetails((prev) => ({ ...prev, cardNumber: formatted }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Booking
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>Secure payment processing for your deposit</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={paymentDetails.cardholderName}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        cardholderName: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Select
                      value={paymentDetails.expiryMonth}
                      onValueChange={(value) => setPaymentDetails((prev) => ({ ...prev, expiryMonth: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = (i + 1).toString().padStart(2, "0")
                          return (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Year</Label>
                    <Select
                      value={paymentDetails.expiryYear}
                      onValueChange={(value) => setPaymentDetails((prev) => ({ ...prev, expiryYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = (new Date().getFullYear() + i).toString()
                          return (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentDetails.cvv}
                      onChange={(e) =>
                        setPaymentDetails((prev) => ({
                          ...prev,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        }))
                      }
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Shield className="w-4 h-4" />
                  <span>Your payment information is encrypted and secure</span>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Billing Address</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      value={billingAddress.street}
                      onChange={(e) =>
                        setBillingAddress((prev) => ({
                          ...prev,
                          street: e.target.value,
                        }))
                      }
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={billingAddress.city}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        placeholder="Cape Town"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        value={billingAddress.state}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        placeholder="Western Cape"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={billingAddress.postalCode}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            postalCode: e.target.value,
                          }))
                        }
                        placeholder="8001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={billingAddress.country}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            country: e.target.value,
                          }))
                        }
                        placeholder="South Africa"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={
                    processing ||
                    !paymentDetails.cardNumber ||
                    !paymentDetails.expiryMonth ||
                    !paymentDetails.expiryYear ||
                    !paymentDetails.cvv ||
                    !paymentDetails.cardholderName ||
                    !billingAddress.street ||
                    !billingAddress.city ||
                    !billingAddress.state ||
                    !billingAddress.postalCode ||
                    !billingAddress.country
                  }
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay Deposit ${bookingData.depositAmount}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">{bookingData.tour.name}</h4>
                <p className="text-sm text-gray-600">
                  {bookingData.customerDetails.firstName} {bookingData.customerDetails.lastName}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Tour Price</span>
                  <span>${bookingData.totalPrice}</span>
                </div>
                <div className="flex justify-between font-medium text-green-600">
                  <span>Deposit (30%)</span>
                  <span>${bookingData.depositAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Remaining Balance</span>
                  <span>${bookingData.totalPrice - bookingData.depositAmount}</span>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-gray-500 space-y-2">
                <p>• Deposit payment secures your booking</p>
                <p>• Final balance due 2-4 weeks before departure</p>
                <p>• You will receive email confirmation after payment</p>
                <p>• Cancellation policy applies as per terms</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
