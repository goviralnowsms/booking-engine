import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()
    const { tour, selectedExtras, customerDetails, searchCriteria, totalPrice, depositAmount } = bookingData

    // Generate booking reference
    const bookingReference = `TIA${Date.now().toString().slice(-6)}`

    // Start transaction
    const { data, error } = await supabase.rpc("create_booking_transaction", {
      p_booking_reference: bookingReference,
      p_tour_id: tour.id,
      p_customer_details: customerDetails,
      p_start_date: searchCriteria.startDate,
      p_end_date: searchCriteria.endDate,
      p_adults: searchCriteria.adults,
      p_children: searchCriteria.children,
      p_total_price: totalPrice,
      p_deposit_amount: depositAmount,
      p_selected_extras: selectedExtras,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({
      bookingReference,
      bookingId: data,
      message: "Booking created successfully",
    })
  } catch (error) {
    return Response.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
