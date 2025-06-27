"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface DebugResult {
  test: string
  status: "pending" | "success" | "error"
  details: string
  response?: any
  httpStatus?: number
}

export default function APIDebugger() {
  const [results, setResults] = useState<DebugResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [customEndpoint, setCustomEndpoint] = useState("")

  const addResult = (
    test: string,
    status: DebugResult["status"],
    details: string,
    response?: any,
    httpStatus?: number,
  ) => {
    setResults((prev) => [...prev, { test, status, details, response, httpStatus }])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    // Test 1: Environment Variables Check
    addResult("Environment Variables", "pending", "Checking environment variables...")
    try {
      const envResponse = await fetch("/api/debug/env-check")
      const envData = await envResponse.json()

      if (envData.success) {
        addResult("Environment Variables", "success", `Found ${envData.variables.length} variables`, envData.variables)
      } else {
        addResult("Environment Variables", "error", envData.error || "Environment variables missing")
      }
    } catch (error) {
      addResult("Environment Variables", "error", `Failed to check env vars: ${error}`)
    }

    // Test 2: Basic Network Connectivity
    addResult("Network Connectivity", "pending", "Testing basic network connectivity...")
    try {
      const networkResponse = await fetch("/api/debug/network-test")
      const networkData = await networkResponse.json()

      addResult(
        "Network Connectivity",
        networkData.success ? "success" : "error",
        networkData.message,
        networkData,
        networkResponse.status,
      )
    } catch (error) {
      addResult("Network Connectivity", "error", `Network test failed: ${error}`)
    }

    // Test 3: Authentication Test
    addResult("Authentication", "pending", "Testing API authentication...")
    try {
      const authResponse = await fetch("/api/debug/auth-test")
      const authData = await authResponse.json()

      addResult(
        "Authentication",
        authData.success ? "success" : "error",
        authData.message,
        authData,
        authResponse.status,
      )
    } catch (error) {
      addResult("Authentication", "error", `Auth test failed: ${error}`)
    }

    // Test 4: API Endpoint Discovery
    addResult("Endpoint Discovery", "pending", "Testing different endpoint paths...")
    try {
      const endpointResponse = await fetch("/api/debug/endpoint-discovery")
      const endpointData = await endpointResponse.json()

      addResult(
        "Endpoint Discovery",
        endpointData.success ? "success" : "error",
        endpointData.message,
        endpointData.results,
      )
    } catch (error) {
      addResult("Endpoint Discovery", "error", `Endpoint discovery failed: ${error}`)
    }

    setIsRunning(false)
  }

  const testCustomEndpoint = async () => {
    if (!customEndpoint) return

    addResult("Custom Endpoint", "pending", `Testing ${customEndpoint}...`)
    try {
      const response = await fetch("/api/debug/custom-endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: customEndpoint }),
      })
      const data = await response.json()

      addResult("Custom Endpoint", data.success ? "success" : "error", data.message, data, response.status)
    } catch (error) {
      addResult("Custom Endpoint", "error", `Custom endpoint test failed: ${error}`)
    }
  }

  const getStatusIcon = (status: DebugResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Production API Debugger</CardTitle>
          <CardDescription>Comprehensive debugging for TourPlan production API issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={runDiagnostics} disabled={isRunning} className="w-full">
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRunning ? "Running Diagnostics..." : "Run Full Diagnostics"}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-endpoint">Test Custom Endpoint</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-endpoint"
                  placeholder="/api/v1/tours"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                />
                <Button onClick={testCustomEndpoint} disabled={!customEndpoint}>
                  Test
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <h3 className="font-semibold">{result.test}</h3>
                  </div>
                  {result.httpStatus && (
                    <Badge variant={result.httpStatus < 400 ? "default" : "destructive"}>
                      HTTP {result.httpStatus}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-2">{result.details}</p>

                {result.response && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Response Data</summary>
                    <Textarea
                      className="mt-2 font-mono text-xs"
                      value={JSON.stringify(result.response, null, 2)}
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
