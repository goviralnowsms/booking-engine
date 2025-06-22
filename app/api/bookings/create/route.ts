import { getTourplanAPI, type TourplanBookingRequest } from "@/lib/tourplan-api"
import { PaymentService } from "@/lib/payment-service"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()
    const { tour, selectedExtras, customerDetails, searchCriteria, totalPrice, depositAmount } = bookingData

    // 1. Double-check availability before creating booking
    const tourplanAPI = getTourplanAPI()

    // 2. Create customer record
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .upsert({
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName,
        email: customerDetails.email,
        phone: customerDetails.phone,
        address: customerDetails.address,
      })
      .select()
      .single()

    if (customerError) {
      console.error("Customer creation failed:", customerError)
      return Response.json({ error: "Failed to create customer record" }, { status: 500 })
    }

    // 3. Create provisional booking in Tourplan (without payment)
    const tourplanBookingRequest: TourplanBookingRequest = {
      tourId: tour.id,
      startDate: searchCriteria.startDate,
      endDate: searchCriteria.endDate,
      adults: searchCriteria.adults,
      children: searchCriteria.children,
      selectedExtras,
      customerDetails,
      createAsProvisional: true, // Key: Create without payment first
    }

    const tourplanResponse = await tourplanAPI.createBooking(tourplanBookingRequest)

    if (tourplanResponse.status === "failed") {
      return Response.json(
        {
          error: "Booking failed with supplier",
          details: tourplanResponse,
        },
        { status: 400 },
      )
    }

    // 4. Create booking record in our database
    const internalReference = `TIA${Date.now().toString().slice(-6)}`

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        booking_reference: internalReference,
        tour_id: tour.id,
        customer_id: customer.id,
        start_date: searchCriteria.startDate,
        end_date: searchCriteria.endDate,
        adults: searchCriteria.adults,
        children: searchCriteria.children,
        total_price: totalPrice,
        deposit_amount: depositAmount,
        status: "pending", // Pending until payment is processed
        tourplan_booking_id: tourplanResponse.bookingId,
      })
      .select()
      .single()

    if (bookingError) {
      console.error("Booking creation failed:", bookingError)
      return Response.json({ error: "Failed to create booking record" }, { status: 500 })
    }

    // 5. Store selected extras
    if (selectedExtras.length > 0) {
      const extrasToInsert = selectedExtras.map((extraId) => {
        const extra = tour.extras.find((e: any) => e.id === extraId)
        return {
          booking_id: booking.id,
          tour_extra_id: extraId,
          quantity: 1,
          unit_price: extra?.price || 0,
        }
      })

      await supabase.from("booking_extras").insert(extrasToInsert)
    }

    // 6. Schedule payment reminder if possible
    await PaymentService.schedulePaymentReminder(booking.id)

    return Response.json({
      bookingId: booking.id,
      bookingReference: internalReference,
      tourplanBookingId: tourplanResponse.bookingId,
      tourplanReference: tourplanResponse.bookingReference,
      status: "provisional", // Booking created but payment pending
      totalPrice: tourplanResponse.totalPrice,
      currency: tourplanResponse.currency,
      depositAmount,
      cancellationDeadline: tourplanResponse.cancellationDeadline,
      message: "Booking created successfully. Proceed to payment to confirm.",
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
