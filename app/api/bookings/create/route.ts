import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()
    console.log("Creating booking:", bookingData)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock booking response
    const bookingReference = `TIA${Date.now().toString().slice(-6)}`

    return Response.json({
      success: true,
      bookingId: `booking-${Date.now()}`,
      bookingReference,
      tourplanBookingId: `tp-${Date.now()}`,
      tourplanReference: `TP${bookingReference}`,
      status: "confirmed",
      totalPrice: bookingData.totalPrice,
      currency: "USD",
      depositAmount: bookingData.depositAmount,
      cancellationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      message: "Booking created successfully in demo mode",
      demo: true,
    })
  } catch (error) {
    console.error("Booking creation failed:", error)
    return Response.json(
      {
        error: "Failed to create booking",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
