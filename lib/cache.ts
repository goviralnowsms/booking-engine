import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export class CacheManager {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      return data as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  static async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    try {
      await redis.set(key, value, { ex: ttlSeconds })
    } catch (error) {
      console.error("Cache set error:", error)
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error("Cache delete error:", error)
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error("Cache invalidate error:", error)
    }
  }

  // Tour-specific cache methods
  static getTourCacheKey(country: string, destination: string, level: string): string {
    return `tours:${country}:${destination}:${level}`
  }

  static getAvailabilityCacheKey(tourId: string, date: string): string {
    return `availability:${tourId}:${date}`
  }

  static async cacheTourAvailability(tourId: string, date: string, availability: any): Promise<void> {
    const key = this.getAvailabilityCacheKey(tourId, date)
    await this.set(key, availability, 600) // Cache for 10 minutes
  }

  static async getTourAvailability(tourId: string, date: string): Promise<any> {
    const key = this.getAvailabilityCacheKey(tourId, date)
    return await this.get(key)
  }
}
