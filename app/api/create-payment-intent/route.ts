import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amount, currency, booking_data } = await request.json()

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json({
        success: false,
        error: "Stripe not configured",
      })
    }

    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(stripeSecretKey)

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        tour_id: booking_data.tour_id,
        customer_email: booking_data.customer.email,
        booking_date: booking_data.booking_date,
        adults: booking_data.number_of_adults.toString(),
        children: booking_data.number_of_children.toString(),
      },
    })

    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Payment intent creation failed",
      },
      { status: 500 },
    )
  }
}
