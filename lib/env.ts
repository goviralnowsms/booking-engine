// Environment variables validation and configuration
export const env = {
  // Tourplan API Configuration
  TOURPLAN_API_URL: process.env.TOURPLAN_API_URL || "",
  TOURPLAN_USERNAME: process.env.TOURPLAN_USERNAME || "",
  TOURPLAN_PASSWORD: process.env.TOURPLAN_PASSWORD || "",
  TOURPLAN_AGENT_ID: process.env.TOURPLAN_AGENT_ID || "",
  TOURPLAN_PROXY_URL: process.env.TOURPLAN_PROXY_URL || "",
  USE_TOURPLAN_PROXY: process.env.USE_TOURPLAN_PROXY === "true",

  // App URLs
  APP_URL: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",

  // Database Configuration - Check all possible Neon variables
  NEON_DATABASE_URL:
    process.env.NEON_POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    "",

  // Supabase Configuration
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",

  // Email Configuration
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_HOST: process.env.EMAIL_HOST || "",
  EMAIL_PORT: process.env.EMAIL_PORT || "587",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "",

  // Payment Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",

  // Redis Configuration (optional)
  KV_REST_API_URL: process.env.KV_REST_API_URL || "",
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || "",

  // Validation functions
  isConfigured: function () {
    return !!(this.TOURPLAN_API_URL && this.TOURPLAN_USERNAME && this.TOURPLAN_PASSWORD && this.TOURPLAN_AGENT_ID)
  },

  isDatabaseConfigured: function () {
    return !!(this.DATABASE_URL || (this.SUPABASE_URL && this.SUPABASE_ANON_KEY))
  },

  isEmailConfigured: function () {
    return !!(this.RESEND_API_KEY || (this.EMAIL_HOST && this.EMAIL_USER && this.EMAIL_PASSWORD))
  },

  isStripeConfigured: function () {
    return !!(this.STRIPE_SECRET_KEY && this.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  },

  isCacheConfigured: function () {
    return !!(this.KV_REST_API_URL && this.KV_REST_API_TOKEN)
  },

  getAppUrl: function () {
    return this.APP_URL || this.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  },

  // Get all missing required variables
  getMissingVariables: function () {
    const missing: string[] = []

    if (!this.TOURPLAN_API_URL) missing.push("TOURPLAN_API_URL")
    if (!this.TOURPLAN_USERNAME) missing.push("TOURPLAN_USERNAME")
    if (!this.TOURPLAN_PASSWORD) missing.push("TOURPLAN_PASSWORD")
    if (!this.TOURPLAN_AGENT_ID) missing.push("TOURPLAN_AGENT_ID")

    if (!this.NEXT_PUBLIC_APP_URL) missing.push("NEXT_PUBLIC_APP_URL")

    if (!this.DATABASE_URL && !this.SUPABASE_URL) {
      missing.push("NEON_POSTGRES_URL or DATABASE_URL or SUPABASE_URL")
    }

    return missing
  },
}

// Validate configuration on startup (server-side only)
if (typeof window === "undefined") {
  const missing = env.getMissingVariables()

  if (missing.length > 0) {
    console.warn("⚠️  Missing required environment variables:", missing.join(", "))
  }

  if (!env.isDatabaseConfigured()) {
    console.warn("⚠️  Database not configured - booking features will be limited")
  }

  if (!env.isEmailConfigured()) {
    console.warn("⚠️  Email not configured - notifications will not work")
  }

  if (!env.isStripeConfigured()) {
    console.warn("⚠️  Stripe not configured - payments will not work")
  }

  console.log("✅ Environment validation complete")
  console.log("📊 Database URL found:", !!env.DATABASE_URL)
}
