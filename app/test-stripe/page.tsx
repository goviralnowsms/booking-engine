"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface StripeTestResult {
  isTestMode: boolean
  keyType: string
  accountInfo?: any
  error?: string
}

export default function StripeTestPage() {
  const [result, setResult] = useState<StripeTestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentTest, setPaymentTest] = useState<any>(null)

  const testStripeConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-stripe-config")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        isTestMode: false,
        keyType: "unknown",
        error: `Test failed: ${error}`,
      })
    }
    setLoading(false)
  }

  const testPaymentIntent = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 5000, // $50.00 in cents
          currency: "aud",
        }),
      })
      const data = await response.json()
      setPaymentTest(data)
    } catch (error) {
      setPaymentTest({
        success: false,
        error: `Payment test failed: ${error}`,
      })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Stripe Configuration Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testStripeConfig} disabled={loading}>
              {loading ? "Testing..." : "Test Stripe Configuration"}
            </Button>

            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {result.isTestMode ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="font-semibold">{result.isTestMode ? "Test Mode Active" : "Live Mode Detected"}</span>
                  <Badge variant={result.isTestMode ? "default" : "destructive"}>{result.keyType}</Badge>
                </div>

                {result.error && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>{result.error}</span>
                  </div>
                )}

                {result.accountInfo && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600">View Account Info</summary>
                    <Textarea
                      className="mt-2 font-mono text-xs"
                      value={JSON.stringify(result.accountInfo, null, 2)}
                      readOnly
                      rows={8}
                    />
                  </details>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Payment Intent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testPaymentIntent} disabled={loading || !result?.isTestMode}>
              {loading ? "Creating..." : "Create Test Payment Intent"}
            </Button>

            {!result?.isTestMode && result && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Switch to test mode before creating payment intents</span>
              </div>
            )}

            {paymentTest && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {paymentTest.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>{paymentTest.success ? "Payment Intent Created" : "Payment Intent Failed"}</span>
                </div>

                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600">View Payment Intent Details</summary>
                  <Textarea
                    className="mt-2 font-mono text-xs"
                    value={JSON.stringify(paymentTest, null, 2)}
                    readOnly
                    rows={10}
                  />
                </details>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Credit Cards for Stripe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Successful Payments:</h4>
                  <ul className="space-y-1 font-mono">
                    <li>4242 4242 4242 4242 (Visa)</li>
                    <li>5555 5555 5555 4444 (Mastercard)</li>
                    <li>3782 822463 10005 (Amex)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Failed Payments:</h4>
                  <ul className="space-y-1 font-mono">
                    <li>4000 0000 0000 0002 (Declined)</li>
                    <li>4000 0000 0000 9995 (Insufficient funds)</li>
                    <li>4000 0000 0000 0069 (Expired card)</li>
                  </ul>
                </div>
              </div>
              <p className="text-gray-600">
                <strong>Expiry:</strong> Any future date (e.g., 12/25) <br />
                <strong>CVC:</strong> Any 3-4 digits (e.g., 123)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
