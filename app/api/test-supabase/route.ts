import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase environment variables",
        envCheck,
        urls: {
          publicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
          privateUrl: process.env.SUPABASE_URL ? "SET" : "NOT SET",
        },
      })
    }

    // Test basic connection
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    const connectionResult = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    }

    // Test with Supabase client
    let clientTest = null
    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Try to query a system table
      const { data, error } = await supabase.from("information_schema.tables").select("table_name").limit(1)

      clientTest = {
        success: !error,
        error: error?.message,
        hasData: !!data,
        dataLength: data?.length || 0,
      }
    } catch (clientError) {
      clientTest = {
        success: false,
        error: clientError instanceof Error ? clientError.message : "Unknown client error",
      }
    }

    return NextResponse.json({
      success: connectionResult.success && (clientTest?.success ?? false),
      message: "Supabase connection test completed",
      envCheck,
      connectionResult,
      clientTest,
      supabaseUrl: supabaseUrl.substring(0, 30) + "...",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Supabase test failed",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
