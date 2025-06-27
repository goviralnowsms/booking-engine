import { supabase, supabaseAdmin } from "./supabase"
import type { Customer, Tour, Booking } from "./database-types"

// Customer operations
export async function createCustomer(customerData: Omit<Customer, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("customers").insert(customerData).select().single()

  if (error) throw error
  return data
}

export async function getCustomerByEmail(email: string) {
  const { data, error } = await supabase.from("customers").select("*").eq("email", email).single()

  if (error && error.code !== "PGRST116") throw error // PGRST116 = not found
  return data
}

// Tour operations
export async function syncTourFromTourPlan(tourData: Omit<Tour, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabaseAdmin
    .from("tours")
    .upsert(tourData, {
      onConflict: "tourplan_product_id",
      ignoreDuplicates: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getActiveTours() {
  const { data, error } = await supabase.from("tours").select("*").eq("is_active", true).order("name")

  if (error) throw error
  return data
}

// Booking operations
export async function createBooking(bookingData: Omit<Booking, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("bookings")
    .insert(bookingData)
    .select(`
      *,
      customer:customers(*),
      tour:tours(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking["status"],
  paymentStatus?: Booking["payment_status"],
) {
  const updateData: Partial<Booking> = { status }
  if (paymentStatus) updateData.payment_status = paymentStatus

  const { data, error } = await supabase.from("bookings").update(updateData).eq("id", bookingId).select().single()

  if (error) throw error
  return data
}

export async function getBookingById(bookingId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      customer:customers(*),
      tour:tours(*),
      booking_items(*),
      payment_transactions(*)
    `)
    .eq("id", bookingId)
    .single()

  if (error) throw error
  return data
}
