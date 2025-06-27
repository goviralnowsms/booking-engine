"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function DatabaseSetup() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const setupDatabase = async () => {
    setIsRunning(true)
    setProgress(0)
    setLogs([])

    try {
      // Step 1: Test connection
      setStatus("Testing Supabase connection...")
      addLog("Testing Supabase connection...")
      const testResponse = await fetch("/api/setup-database/test")
      const testResult = await testResponse.json()

      if (!testResult.success) {
        throw new Error(`Connection failed: ${testResult.message}`)
      }
      addLog("✅ Supabase connection successful")
      setProgress(20)

      // Step 2: Create customers table
      setStatus("Creating customers table...")
      addLog("Creating customers table...")
      const customersResponse = await fetch("/api/setup-database/customers", { method: "POST" })
      const customersResult = await customersResponse.json()
      addLog(customersResult.success ? "✅ Customers table created" : `❌ ${customersResult.error}`)
      setProgress(40)

      // Step 3: Create tours table
      setStatus("Creating tours table...")
      addLog("Creating tours table...")
      const toursResponse = await fetch("/api/setup-database/tours", { method: "POST" })
      const toursResult = await toursResponse.json()
      addLog(toursResult.success ? "✅ Tours table created" : `❌ ${toursResult.error}`)
      setProgress(60)

      // Step 4: Create bookings table
      setStatus("Creating bookings table...")
      addLog("Creating bookings table...")
      const bookingsResponse = await fetch("/api/setup-database/bookings", { method: "POST" })
      const bookingsResult = await bookingsResponse.json()
      addLog(bookingsResult.success ? "✅ Bookings table created" : `❌ ${bookingsResult.error}`)
      setProgress(80)

      // Step 5: Create indexes
      setStatus("Creating indexes...")
      addLog("Creating indexes...")
      const indexesResponse = await fetch("/api/setup-database/indexes", { method: "POST" })
      const indexesResult = await indexesResponse.json()
      addLog(indexesResult.success ? "✅ Indexes created" : `❌ ${indexesResult.error}`)
      setProgress(100)

      setStatus("Database setup complete!")
      addLog("🎉 Database setup completed successfully!")
    } catch (error) {
      addLog(`❌ Setup failed: ${error}`)
      setStatus("Setup failed")
    }

    setIsRunning(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={setupDatabase} disabled={isRunning} className="w-full">
            {isRunning ? "Setting up database..." : "Setup Database Tables"}
          </Button>

          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-gray-600">{status}</p>
            </div>
          )}

          <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono">
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
