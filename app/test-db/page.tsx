"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Database } from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
}

export default function DatabaseTestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const client = createClient(supabaseUrl, supabaseKey)
      setSupabase(client)
    }
  }, [])

  const runTests = async () => {
    if (!supabase) {
      setResults([
        {
          name: "Environment Variables",
          status: "error",
          message: "Supabase environment variables not found",
          details: {
            NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          },
        },
      ])
      return
    }

    setTesting(true)
    const testResults: TestResult[] = []

    // Test 1: Environment Variables
    testResults.push({
      name: "Environment Variables",
      status: "success",
      message: "Supabase environment variables found",
      details: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    })

    // Test 2: Connection Test
    try {
      const { data, error } = await supabase.from("customers").select("count").limit(1)
      if (error) {
        testResults.push({
          name: "Database Connection",
          status: "error",
          message: `Connection failed: ${error.message}`,
          details: error,
        })
      } else {
        testResults.push({
          name: "Database Connection",
          status: "success",
          message: "Successfully connected to Supabase",
        })
      }
    } catch (err) {
      testResults.push({
        name: "Database Connection",
        status: "error",
        message: `Connection error: ${err instanceof Error ? err.message : "Unknown error"}`,
      })
    }

    // Test 3: Check Tables Exist
    const tables = ["customers", "bookings", "payments", "booking_extras"]
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1)
        if (error) {
          testResults.push({
            name: `Table: ${table}`,
            status: "error",
            message: `Table not found or accessible: ${error.message}`,
            details: error,
          })
        } else {
          testResults.push({
            name: `Table: ${table}`,
            status: "success",
            message: `Table exists and accessible`,
          })
        }
      } catch (err) {
        testResults.push({
          name: `Table: ${table}`,
          status: "error",
          message: `Error checking table: ${err instanceof Error ? err.message : "Unknown error"}`,
        })
      }
    }

    // Test 4: Create Test Customer
    try {
      const testEmail = `test-${Date.now()}@example.com`
      const { data: customer, error } = await supabase
        .from("customers")
        .insert({
          first_name: "Test",
          last_name: "Customer",
          email: testEmail,
          phone: "+1234567890",
        })
        .select()
        .single()

      if (error) {
        testResults.push({
          name: "Create Test Customer",
          status: "error",
          message: `Failed to create customer: ${error.message}`,
          details: error,
        })
      } else {
        testResults.push({
          name: "Create Test Customer",
          status: "success",
          message: "Successfully created test customer",
          details: customer,
        })

        // Test 5: Clean up test data
        const { error: deleteError } = await supabase.from("customers").delete().eq("id", customer.id)
        if (deleteError) {
          testResults.push({
            name: "Cleanup Test Data",
            status: "warning",
            message: `Test customer created but cleanup failed: ${deleteError.message}`,
          })
        } else {
          testResults.push({
            name: "Cleanup Test Data",
            status: "success",
            message: "Test customer cleaned up successfully",
          })
        }
      }
    } catch (err) {
      testResults.push({
        name: "Create Test Customer",
        status: "error",
        message: `Error creating customer: ${err instanceof Error ? err.message : "Unknown error"}`,
      })
    }

    setResults(testResults)
    setTesting(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Integration Test</h1>
          <p className="text-gray-600">Test your database connection and table structure</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Connection Test
            </CardTitle>
            <CardDescription>
              This will test your Supabase connection, tables, and basic CRUD operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} disabled={testing} className="w-full" size="lg">
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Tests...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Run Database Tests
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
            {results.map((result, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{result.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer">Show Details</summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• If all tests pass, your Supabase integration is working correctly</li>
                <li>• If tables are missing, run the SQL script in your Supabase dashboard</li>
                <li>• If connection fails, check your environment variables in Vercel</li>
                <li>• Return to the main booking engine to test the full flow</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
