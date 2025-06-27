"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface TestResult {
  endpoint: string
  status: "pending" | "success" | "error"
  response?: any
  error?: string
  duration?: number
}

export default function ProductionAPITester() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateTestResult = (endpoint: string, result: Partial<TestResult>) => {
    setTestResults((prev) => {
      const existing = prev.find((r) => r.endpoint === endpoint)
      if (existing) {
        return prev.map((r) => (r.endpoint === endpoint ? { ...r, ...result } : r))
      }
      return [...prev, { endpoint, status: "pending", ...result }]
    })
  }

  const testEndpoint = async (endpoint: string, testFn: () => Promise<any>) => {
    updateTestResult(endpoint, { status: "pending" })
    const startTime = Date.now()

    try {
      const response = await testFn()
      const duration = Date.now() - startTime
      updateTestResult(endpoint, {
        status: "success",
        response,
        duration,
      })
    } catch (error) {
      const duration = Date.now() - startTime
      updateTestResult(endpoint, {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      })
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    // Test 1: API Connection
    await testEndpoint("API Connection", async () => {
      const response = await fetch("/api/tourplan/test-connection")
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    })

    // Test 2: Get Tours/Products
    await testEndpoint("Get Tours", async () => {
      const response = await fetch("/api/tourplan/tours")
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    })

    // Test 3: Get Availability
    await testEndpoint("Check Availability", async () => {
      const response = await fetch("/api/tourplan/availability?date=2024-07-01&tourId=sample")
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    })

    // Test 4: Get Pricing
    await testEndpoint("Get Pricing", async () => {
      const response = await fetch("/api/tourplan/pricing?tourId=sample&date=2024-07-01")
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    })

    setIsRunning(false)
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Production API Testing</CardTitle>
          <CardDescription>Test all production API endpoints before enabling payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runAllTests} disabled={isRunning} className="w-full">
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>

          <div className="space-y-3">
            {testResults.map((result) => (
              <Card key={result.endpoint} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{result.endpoint}</h3>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                    {result.duration && <span className="text-sm text-gray-500">{result.duration}ms</span>}
                  </div>
                </div>

                {result.error && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded">Error: {result.error}</div>
                )}

                {result.response && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600">View Response</summary>
                    <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-xs">
                      {JSON.stringify(result.response, null, 2)}
                    </pre>
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
