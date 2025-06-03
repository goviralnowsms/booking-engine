import { createClient } from "@supabase/supabase-js"
import { Redis } from "@upstash/redis"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

const redis = Redis.fromEnv()

export async function POST(request: Request) {
  try {
    const searchParams = await request.json()
    const { country, destination, tourLevel, startDate, endDate, adults, children } = searchParams

    // Create cache key
    const cacheKey = `tours:${country}:${destination}:${tourLevel}:${startDate}:${endDate}`

    // Try to get from cache first
    const cachedResults = await redis.get(cacheKey)
    if (cachedResults) {
      return Response.json({
        tours: cachedResults,
        cached: true,
        timestamp: new Date().toISOString(),
      })
    }

    // Query database
    let query = supabase
      .from("tours")
      .select(`
        *,
        destinations!inner(name, countries!inner(name)),
        suppliers(name),
        tour_extras(*)
      `)
      .eq("level", tourLevel)

    if (destination) {
      query = query.eq("destinations.name", destination)
    }

    if (country) {
      query = query.eq("destinations.countries.name", country)
    }

    const { data: tours, error } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Cache results for 5 minutes
    await redis.set(cacheKey, tours, { ex: 300 })

    return Response.json({
      tours,
      cached: false,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json({ error: "Failed to search tours" }, { status: 500 })
  }
}
