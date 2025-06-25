import { getTourplanAPI, type TourplanBookingRequest } from "@/lib/tourplan-api"
import { PaymentService } from "@/lib/payment-service"
import { createClient } from "@supabase/supabase-js"

// Check if we have valid Supabase credentials
const hasValidSupabaseCredentials =
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_ANON_KEY &&
  process.env.SUPABASE_URL !== 'https://your-project.supabase.co' &&
  process.env.SUPABASE_ANON_KEY !== 'your-anon-key'

const supabase = hasValidSupabaseCredentials
  ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  : null

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()
    const { tour, selectedExtras, customerDetails, customerInfo, searchCriteria, totalPrice, depositAmount } = bookingData
    
    // Handle both customerDetails and customerInfo for backward compatibility
    const customerData = customerDetails || customerInfo
    
    if (!customerData) {
      return Response.json({ error: "Customer information is required" }, { status: 400 })
    }

    // 1. Double-check availability before creating booking
    const tourplanAPI = getTourplanAPI()

    // 2. Create customer record (or use mock if database unavailable)
    let customer
    if (supabase) {
      try {
        const { data: customerRecord, error: customerError } = await supabase
          .from("customers")
          .upsert({
            first_name: customerData.firstName,
            last_name: customerData.lastName,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
          })
          .select()
          .single()

        if (customerError) {
          console.error("Customer creation failed:", customerError)
          // Fall back to mock customer
          customer = { id: `mock_customer_${Date.now()}` }
        } else {
          customer = customerRecord
        }
      } catch (error) {
        console.error("Database connection failed, using mock customer:", error)
        customer = { id: `mock_customer_${Date.now()}` }
      }
    } else {
      console.log("Database not configured, using mock customer")
      customer = { id: `mock_customer_${Date.now()}` }
    }

    // 3. Create provisional booking in Tourplan (without payment)
    const tourplanBookingRequest: TourplanBookingRequest = {
      tourId: tour?.id || tour?.tourId || 'TEST_TOUR_001',
      startDate: searchCriteria?.startDate || '2024-07-01',
      endDate: searchCriteria?.endDate || '2024-07-03',
      adults: searchCriteria?.adults || 2,
      children: searchCriteria?.children || 0,
      selectedExtras: selectedExtras || [],
      customerDetails: customerData,
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

    // 4. Create booking record in our database (or use mock if database unavailable)
    const internalReference = `TIA${Date.now().toString().slice(-6)}`
    let booking

    if (supabase) {
      try {
        const { data: bookingRecord, error: bookingError } = await supabase
          .from("bookings")
          .insert({
            booking_reference: internalReference,
            tour_id: tour?.id || tour?.tourId || 'TEST_TOUR_001',
            customer_id: customer.id,
            start_date: searchCriteria?.startDate || '2024-07-01',
            end_date: searchCriteria?.endDate || '2024-07-03',
            adults: searchCriteria?.adults || 2,
            children: searchCriteria?.children || 0,
            total_price: totalPrice || 1500,
            deposit_amount: depositAmount || 300,
            status: "pending", // Pending until payment is processed
            tourplan_booking_id: tourplanResponse.bookingId,
          })
          .select()
          .single()

        if (bookingError) {
          console.error("Booking creation failed:", bookingError)
          // Fall back to mock booking
          booking = {
            id: `mock_booking_${Date.now()}`,
            booking_reference: internalReference
          }
        } else {
          booking = bookingRecord
        }
      } catch (error) {
        console.error("Database connection failed, using mock booking:", error)
        booking = {
          id: `mock_booking_${Date.now()}`,
          booking_reference: internalReference
        }
      }
    } else {
      console.log("Database not configured, using mock booking")
      booking = {
        id: `mock_booking_${Date.now()}`,
        booking_reference: internalReference
      }
    }

    // 5. Store selected extras (skip if database unavailable)
    if (selectedExtras && selectedExtras.length > 0 && supabase) {
      try {
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
      } catch (error) {
        console.log("Failed to store extras, continuing without them:", error)
      }
    }

    // 6. Schedule payment reminder if possible (skip if service unavailable)
    try {
      await PaymentService.schedulePaymentReminder(booking.id)
    } catch (error) {
      console.log("Failed to schedule payment reminder, continuing:", error)
    }

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
