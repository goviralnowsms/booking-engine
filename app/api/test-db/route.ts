import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Check if environment variables exist
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({
        success: false,
        status: "❌ Supabase environment variables not found",
        details: {
          SUPABASE_URL: !!supabaseUrl,
          SUPABASE_ANON_KEY: !!supabaseKey,
        },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test basic connection
    const { data, error } = await supabase.from("customers").select("count").limit(1)

    if (error) {
      return Response.json({
        success: false,
        status: `❌ Database Error: ${error.message}`,
        details: error,
      })
    }

    return Response.json({
      success: true,
      status: "✅ Database Connected Successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return Response.json({
      success: false,
      status: `❌ Connection Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      details: err,
    })
  }
}
