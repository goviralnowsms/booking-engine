import { NextResponse } from "next/server"

export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json({
        isTestMode: false,
        keyType: "missing",
        error: "STRIPE_SECRET_KEY environment variable not found",
      })
    }

    // Check if it's a test key
    const isTestKey = stripeSecretKey.startsWith("sk_test_")
    const isLiveKey = stripeSecretKey.startsWith("sk_live_")

    let keyType = "unknown"
    if (isTestKey) keyType = "test"
    if (isLiveKey) keyType = "live"

    // Test Stripe connection
    try {
      const Stripe = (await import("stripe")).default
      const stripe = new Stripe(stripeSecretKey)

      // Get account info to verify connection
      const account = await stripe.accounts.retrieve()

      return NextResponse.json({
        isTestMode: isTestKey,
        keyType,
        accountInfo: {
          id: account.id,
          country: account.country,
          default_currency: account.default_currency,
          email: account.email,
          business_profile: account.business_profile,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
        },
      })
    } catch (stripeError) {
      return NextResponse.json({
        isTestMode: isTestKey,
        keyType,
        error: `Stripe API error: ${stripeError instanceof Error ? stripeError.message : stripeError}`,
      })
    }
  } catch (error) {
    return NextResponse.json({
      isTestMode: false,
      keyType: "error",
      error: `Configuration test failed: ${error instanceof Error ? error.message : error}`,
    })
  }
}
