import { createClient } from "@supabase/supabase-js"
import { Redis } from "@upstash/redis"

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    supabase: { status: "unknown", details: "" },
    redis: { status: "unknown", details: "" },
    environment: {
      supabaseUrl: process.env.SUPABASE_URL ? "set" : "missing",
      supabaseKey: process.env.SUPABASE_ANON_KEY ? "set" : "missing",
      redisUrl: process.env.KV_REST_API_URL ? "set" : "missing",
      redisToken: process.env.KV_REST_API_TOKEN ? "set" : "missing",
    },
  }

  // Test Supabase connection
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      results.supabase = { status: "error", details: "Missing environment variables" }
    } else {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

      // Try a simple query to test connection
      const { data, error } = await supabase.from("information_schema.tables").select("table_name").limit(1)

      if (error) {
        results.supabase = { status: "error", details: error.message }
      } else {
        results.supabase = { status: "connected", details: "Successfully connected to Supabase" }
      }
    }
  } catch (e) {
    results.supabase = { status: "error", details: (e as Error).message }
  }

  // Test Redis connection
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      results.redis = { status: "error", details: "Missing environment variables" }
    } else {
      const redis = Redis.fromEnv()
      const testKey = `test-${Date.now()}`

      await redis.set(testKey, "connection-test", { ex: 60 })
      const testValue = await redis.get(testKey)
      await redis.del(testKey)

      if (testValue === "connection-test") {
        results.redis = { status: "connected", details: "Successfully connected to Redis" }
      } else {
        results.redis = { status: "error", details: "Failed to read/write test data" }
      }
    }
  } catch (e) {
    results.redis = { status: "error", details: (e as Error).message }
  }

  return Response.json(results, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
