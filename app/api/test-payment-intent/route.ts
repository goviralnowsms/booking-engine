import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amount, currency = "aud" } = await request.json()

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json({
        success: false,
        error: "STRIPE_SECRET_KEY not configured",
      })
    }

    if (!stripeSecretKey.startsWith("sk_test_")) {
      return NextResponse.json({
        success: false,
        error: "Only test keys allowed for testing",
      })
    }

    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(stripeSecretKey)

    // Create a test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 5000, // Default $50.00
      currency: currency.toLowerCase(),
      metadata: {
        test: "true",
        created_by: "v0-booking-system",
      },
    })

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        created: paymentIntent.created,
      },
      message: "Test payment intent created successfully",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Payment intent creation failed: ${error instanceof Error ? error.message : error}`,
    })
  }
}
