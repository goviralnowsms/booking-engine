// Environment variables validation and configuration
export const env = {
  // Tourplan API Configuration
  TOURPLAN_API_URL: process.env.TOURPLAN_API_URL || "",
  TOURPLAN_USERNAME: process.env.TOURPLAN_USERNAME || "",
  TOURPLAN_PASSWORD: process.env.TOURPLAN_PASSWORD || "",
  TOURPLAN_AGENT_ID: process.env.TOURPLAN_AGENT_ID || "",
  TOURPLAN_PROXY_URL: process.env.TOURPLAN_PROXY_URL || "",
  USE_TOURPLAN_PROXY: process.env.USE_TOURPLAN_PROXY === "true",

  // Database Configuration (optional)
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",

  // Redis Configuration (optional)
  KV_REST_API_URL: process.env.KV_REST_API_URL || "",
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || "",

  // Validation - only require Tourplan essentials
  isConfigured: function () {
    return !!(this.TOURPLAN_API_URL && this.TOURPLAN_USERNAME && this.TOURPLAN_PASSWORD && this.TOURPLAN_AGENT_ID)
  },

  // Check if database is configured
  isDatabaseConfigured: function () {
    return !!(this.SUPABASE_URL && this.SUPABASE_ANON_KEY)
  },

  // Check if cache is configured
  isCacheConfigured: function () {
    return !!(this.KV_REST_API_URL && this.KV_REST_API_TOKEN)
  },
}

// Validate configuration on startup
if (typeof window === "undefined") {
  // Server-side only
  if (!env.isConfigured()) {
    console.warn("Missing required environment variables for Tourplan integration")
  }
  if (!env.isDatabaseConfigured()) {
    console.warn("Database not configured - booking features will be limited")
  }
  if (!env.isCacheConfigured()) {
    console.warn("Cache not configured - performance may be impacted")
  }
}
