import { NextResponse } from "next/server"
import { env } from "@/lib/env"

export async function GET() {
  try {
    const envStatus = {
      // Core configuration
      tourplan: {
        configured: env.isConfigured(),
        hasApiUrl: !!env.TOURPLAN_API_URL,
        hasUsername: !!env.TOURPLAN_USERNAME,
        hasPassword: !!env.TOURPLAN_PASSWORD,
        hasAgentId: !!env.TOURPLAN_AGENT_ID,
        hasProxy: !!env.TOURPLAN_PROXY_URL,
        useProxy: env.USE_TOURPLAN_PROXY,
      },

      // App URLs
      urls: {
        appUrl: env.getAppUrl(),
        hasAppUrl: !!env.APP_URL,
        hasPublicAppUrl: !!env.NEXT_PUBLIC_APP_URL,
      },

      // Database - Check for NEON_POSTGRES_URL specifically
      database: {
        configured: env.isDatabaseConfigured(),
        hasNeonPostgresUrl: !!process.env.NEON_POSTGRES_URL,
        hasDatabaseUrl: !!process.env.NEON_DATABASE_URL,
        hasSupabaseUrl: !!env.SUPABASE_URL,
        hasSupabaseKey: !!env.SUPABASE_ANON_KEY,
        actualDatabaseUrl: !!env.DATABASE_URL,
      },

      // Email
      email: {
        configured: env.isEmailConfigured(),
        hasResend: !!env.RESEND_API_KEY,
        hasSmtp: !!(env.EMAIL_HOST && env.EMAIL_USER),
        emailFrom: env.EMAIL_FROM || "Not set",
      },

      // Payments
      stripe: {
        configured: env.isStripeConfigured(),
        hasSecretKey: !!env.STRIPE_SECRET_KEY,
        hasPublishableKey: !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      },

      // Cache
      cache: {
        configured: env.isCacheConfigured(),
        hasKvUrl: !!env.KV_REST_API_URL,
        hasKvToken: !!env.KV_REST_API_TOKEN,
      },

      // Missing variables
      missing: env.getMissingVariables(),

      // Overall status
      ready: env.isConfigured() && env.isDatabaseConfigured() && !!env.NEXT_PUBLIC_APP_URL,

      // Debug info
      debug: {
        neonPostgresUrl: process.env.NEON_POSTGRES_URL ? "Set" : "Not set",
        databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
        resolvedDatabaseUrl: env.DATABASE_URL ? "Resolved" : "Not resolved",
      },
    }

    return NextResponse.json(envStatus, { status: 200 })
  } catch (error) {
    console.error("Environment debug error:", error)
    return NextResponse.json(
      {
        error: "Failed to check environment variables",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
