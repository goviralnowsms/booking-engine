"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SimpleAPITest() {
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [testUrl, setTestUrl] = useState("")
  const [testAuth, setTestAuth] = useState("")

  const testBasicConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/simple-test")
      const data = await response.text()
      setResult(data)
    } catch (error) {
      setResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  const testCustom = async () => {
    if (!testUrl) return

    setLoading(true)
    try {
      const response = await fetch("/api/simple-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: testUrl,
          auth: testAuth,
        }),
      })
      const data = await response.text()
      setResult(data)
    } catch (error) {
      setResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Simple API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testBasicConnection} disabled={loading}>
            {loading ? "Testing..." : "Test Current Environment Variables"}
          </Button>

          <div className="space-y-2">
            <Label>Test Custom URL</Label>
            <Input
              placeholder="https://api.tourplan.com"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Test Custom Auth (username:password)</Label>
            <Input
              placeholder="username:password"
              type="password"
              value={testAuth}
              onChange={(e) => setTestAuth(e.target.value)}
            />
          </div>

          <Button onClick={testCustom} disabled={loading || !testUrl}>
            Test Custom Configuration
          </Button>

          <div className="space-y-2">
            <Label>Result</Label>
            <Textarea value={result} readOnly rows={20} className="font-mono text-xs" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
