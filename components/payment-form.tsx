"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { BookingData } from "@/app/page"
import { CreditCard, ArrowLeft, Loader2, Info } from "lucide-react"

interface PaymentFormProps {
  bookingData: BookingData
  onPaymentComplete: (reference: string) => void
  onBack: () => void
}

export function PaymentForm({ bookingData, onPaymentComplete, onBack }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStripePayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const bookingReference = `BOOK-${Date.now()}`

      const response = await fetch("/api/create-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: bookingData.depositAmount,
          currency: "aud",
          description: `${bookingData.tour.name} - Deposit Payment`,
          customerEmail: bookingData.customerDetails.email,
          bookingReference: bookingReference,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Payment session creation failed")
      }

      // Store booking reference for later use
      localStorage.setItem("pendingBookingReference", bookingReference)
      localStorage.setItem("pendingBookingData", JSON.stringify(bookingData))

      // Redirect to Stripe Checkout
      window.location.href = result.url
    } catch (err) {
      console.error("Payment error:", err)
      setError(err instanceof Error ? err.message : "Payment failed")
      setIsProcessing(false)
    }
  }

  const handleDemoPayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const bookingReference = `DEMO-${Date.now()}`
      onPaymentComplete(bookingReference)
    } catch (err) {
      setError("Demo payment failed")
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Booking
        </Button>
        <h1 className="text-2xl font-bold">Payment</h1>
      </div>

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{bookingData.tour.name}</h3>
            <p className="text-sm text-gray-600">{bookingData.tour.description}</p>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Customer:</strong> {bookingData.customerDetails.firstName} {bookingData.customerDetails.lastName}
            </p>
            <p>
              <strong>Email:</strong> {bookingData.customerDetails.email}
            </p>
            <p>
              <strong>Phone:</strong> {bookingData.customerDetails.phone}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tour Price:</span>
              <span>${bookingData.tour.price.toFixed(2)}</span>
            </div>

            {bookingData.selectedExtras && bookingData.selectedExtras.length > 0 && (
              <div className="flex justify-between">
                <span>Extras:</span>
                <span>${(bookingData.totalPrice - bookingData.tour.price).toFixed(2)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span>${bookingData.totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-orange-600">
              <span>Deposit Required (30%):</span>
              <span>${bookingData.depositAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Remaining Balance:</span>
              <span>${(bookingData.totalPrice - bookingData.depositAmount).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Test Mode Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-blue-800 text-sm">
                <p className="font-semibold">Test Mode Active</p>
                <p>
                  Use test card: <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code>
                </p>
                <p>Any future date, any CVC, any postal code</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Stripe Payment */}
            <Button
              onClick={handleStripePayment}
              disabled={isProcessing}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Pay ${bookingData.depositAmount.toFixed(2)} with Stripe
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            {/* Demo Payment */}
            <Button
              onClick={handleDemoPayment}
              disabled={isProcessing}
              variant="outline"
              className="w-full h-12 bg-transparent"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Demo Payment (Skip Stripe)
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Secure payment processing with Stripe</p>
            <p>• Your payment information is encrypted and secure</p>
            <p>• You will receive a confirmation email after payment</p>
            <p>• This is test mode - no real charges will be made</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
