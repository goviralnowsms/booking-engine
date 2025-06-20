// Environment variables validation and configuration
export const env = {
  // Tourplan API Configuration
  TOURPLAN_API_URL: process.env.TOURPLAN_API_URL || "",
  TOURPLAN_USERNAME: process.env.TOURPLAN_USERNAME || "",
  TOURPLAN_PASSWORD: process.env.TOURPLAN_PASSWORD || "",
  TOURPLAN_AGENT_ID: process.env.TOURPLAN_AGENT_ID || "",

  // Database Configuration
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",

  // Redis Configuration
  KV_REST_API_URL: process.env.KV_REST_API_URL || "",
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || "",

  // Validation
  isConfigured: function () {
    return !!(
      this.TOURPLAN_API_URL &&
      this.TOURPLAN_USERNAME &&
      this.TOURPLAN_PASSWORD &&
      this.TOURPLAN_AGENT_ID &&
      this.SUPABASE_URL &&
      this.SUPABASE_ANON_KEY
    )
  },
}

// Validate configuration on startup
if (typeof window === "undefined") {
  // Server-side only
  if (!env.isConfigured()) {
    console.warn("Missing required environment variables for Tourplan integration")
  }
}
