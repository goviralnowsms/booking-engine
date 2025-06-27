"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface TestResult {
  test: string
  status: "success" | "error" | "pending"
  message: string
  details?: any
}

export default function HostConnectTester() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, status: TestResult["status"], message: string, details?: any) => {
    setResults((prev) => [...prev, { test, status, message, details }])
  }

  const testHostConnect = async () => {
    setLoading(true)
    setResults([])

    // Test 1: Basic connectivity to HostConnect API
    addResult("HostConnect Connectivity", "pending", "Testing connection to HostConnect API...")
    try {
      const response = await fetch("/api/hostconnect/test-connection")
      const data = await response.json()

      addResult("HostConnect Connectivity", data.success ? "success" : "error", data.message, data)
    } catch (error) {
      addResult("HostConnect Connectivity", "error", `Connection test failed: ${error}`)
    }

    // Test 2: Test SOAP envelope structure
    addResult("SOAP Structure Test", "pending", "Testing SOAP envelope format...")
    try {
      const response = await fetch("/api/hostconnect/test-soap")
      const data = await response.json()

      addResult("SOAP Structure Test", data.success ? "success" : "error", data.message, data)
    } catch (error) {
      addResult("SOAP Structure Test", "error", `SOAP test failed: ${error}`)
    }

    // Test 3: Test authentication
    addResult("Authentication Test", "pending", "Testing HostConnect authentication...")
    try {
      const response = await fetch("/api/hostconnect/test-auth")
      const data = await response.json()

      addResult("Authentication Test", data.success ? "success" : "error", data.message, data)
    } catch (error) {
      addResult("Authentication Test", "error", `Auth test failed: ${error}`)
    }

    // Test 4: Test basic HostConnect operation
    addResult("Basic Operation Test", "pending", "Testing basic HostConnect operation...")
    try {
      const response = await fetch("/api/hostconnect/test-operation")
      const data = await response.json()

      addResult("Basic Operation Test", data.success ? "success" : "error", data.message, data)
    } catch (error) {
      addResult("Basic Operation Test", "error", `Operation test failed: ${error}`)
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>TourPlan HostConnect API Tester</CardTitle>
          <p className="text-sm text-gray-600">
            Testing HostConnect API: https://pa-thisis.nx.tourplan.net/hostconnect/api/hostConnectApi
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testHostConnect} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Running HostConnect Tests..." : "Test HostConnect API"}
          </Button>

          <div className="space-y-3">
            {results.map((result, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{result.test}</h3>
                  <Badge
                    className={
                      result.status === "success"
                        ? "bg-green-500"
                        : result.status === "error"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    }
                  >
                    {result.status}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-2">{result.message}</p>

                {result.details && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600">View Details</summary>
                    <Textarea
                      className="mt-2 font-mono text-xs"
                      value={JSON.stringify(result.details, null, 2)}
                      readOnly
                      rows={10}
                    />
                  </details>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
