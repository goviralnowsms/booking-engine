import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

export class CacheManager {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      return data as T | null
    } catch (error) {
      console.error(`Failed to get data from cache for key ${key}:`, error)
      return null
    }
  }

  static async set<T>(key: string, data: T, expiry: number): Promise<void> {
    try {
      await redis.set(key, data, { ex: expiry })
    } catch (error) {
      console.error(`Failed to set data in cache for key ${key}:`, error)
    }
  }

  static getTourCacheKey(country: string, destination: string, tourLevel: string): string {
    return `tours:${country}:${destination}:${tourLevel}`
  }

  static async getTourAvailability(tourId: string, date: string): Promise<any | null> {
    try {
      const data = await redis.get(`availability:${tourId}:${date}`)
      return data || null
    } catch (error) {
      console.error(`Failed to get tour availability from cache for tour ${tourId} and date ${date}:`, error)
      return null
    }
  }

  static async cacheTourAvailability(tourId: string, date: string, availability: any): Promise<void> {
    try {
      await redis.set(`availability:${tourId}:${date}`, availability, { ex: 600 }) // Cache for 10 minutes
    } catch (error) {
      console.error(`Failed to cache tour availability for tour ${tourId} and date ${date}:`, error)
    }
  }
}
