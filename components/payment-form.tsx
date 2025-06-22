"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Lock, Shield } from "lucide-react"
import type { BookingData } from "@/app/page"
import { initiatePayment, verifyPaymentStatus, processPaymentCallback } from "@/lib/paymentAPI"
// Import the payment config to display the correct provider name
import { PAYMENT_CONFIG } from "@/lib/api/config"

interface PaymentFormProps {
  bookingData: BookingData
  onPaymentComplete: (reference: string) => void
  onBack: () => void
}

export function PaymentForm({ bookingData, onPaymentComplete, onBack }: PaymentFormProps) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<string>(PAYMENT_CONFIG.PROVIDER)

  const initiatePaymentProcess = async () => {
    try {
      setProcessing(true)
      setError(null)

      // Call our API function to initiate payment
      const paymentSession = await initiatePayment(bookingData)

      // Store payment ID and provider in session storage for verification when redirected back
      sessionStorage.setItem("paymentId", paymentSession.paymentId)
      sessionStorage.setItem("paymentProvider", paymentSession.provider)
      sessionStorage.setItem("bookingDetails", JSON.stringify(bookingData))

      // Redirect to payment provider's payment page
      window.location.href = paymentSession.redirectUrl
    } catch (err) {
      console.error("Error initiating payment:", err)
      setError("There was an error initiating the payment. Please try again.")
      setProcessing(false)
    }
  }

  // Check if returning from payment provider's page
  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const status = urlParams.get("status") || urlParams.get("session_id") // Support both Tyro and Stripe parameters

      // Get stored payment ID
      const paymentId = sessionStorage.getItem("paymentId")
      const storedProvider = sessionStorage.getItem("paymentProvider")
      const storedBookingData = sessionStorage.getItem("bookingDetails")

      // Update the payment provider state if available
      if (storedProvider) {
        setPaymentProvider(storedProvider)
      }

      // If we have a payment ID and we're returning from payment page
      if (paymentId && (status || urlParams.size > 0)) {
        setProcessing(true)

        try {
          // First try to process the callback data directly
          const callbackResult = await processPaymentCallback(Object.fromEntries(urlParams))
          
          if (callbackResult.status === "COMPLETED") {
            // Clear session storage
            sessionStorage.removeItem("paymentId")
            sessionStorage.removeItem("paymentProvider")
            sessionStorage.removeItem("bookingDetails")

            // Complete the payment process
            onPaymentComplete(callbackResult.reference)
          } else {
            // If callback processing doesn't confirm completion, verify directly
            const verificationResult = await verifyPaymentStatus(paymentId)
            
            if (verificationResult.status === "COMPLETED") {
              // Clear session storage
              sessionStorage.removeItem("paymentId")
              sessionStorage.removeItem("paymentProvider")
              sessionStorage.removeItem("bookingDetails")

              // Complete the payment process
              onPaymentComplete(verificationResult.reference)
            } else {
              setError("Payment was not completed. Please try again.")
              setProcessing(false)
            }
          }
        } catch (err) {
          console.error("Error verifying payment:", err)
          setError("There was an error verifying your payment. Please contact customer support.")
          setProcessing(false)
        }
      }
    }

    checkPaymentStatus()
  }, [onPaymentComplete])

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
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <Shield className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Secure Payment with {paymentProvider === 'tyro' ? 'Tyro' : 'Stripe'}</p>
                    <p>You'll be redirected to {paymentProvider === 'tyro' ? 'Tyro' : 'Stripe'}'s secure payment page to complete your transaction.</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-medium text-blue-800">Payment Information</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• All payments are processed securely by {paymentProvider === 'tyro' ? 'Tyro' : 'Stripe'}</li>
                    <li>• Your card details are never stored on our servers</li>
                    <li>• You'll only be charged the deposit amount today</li>
                    <li>• Supported cards: Visa, Mastercard, American Express</li>
                  </ul>
                </div>

                <Button
                  onClick={initiatePaymentProcess}
                  className="w-full"
                  size="lg"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay Deposit ${bookingData.depositAmount} Securely
                    </>
                  )}
                </Button>
              </div>
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
