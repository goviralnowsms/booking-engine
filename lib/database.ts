import { neon } from "@neondatabase/serverless"

/**
 * Get (or create) a Neon SQL client.
 * Uses pooled connection for better performance.
 */
function getSql() {
  // Use pooled connection first (recommended for production)
  const url =
    process.env.NEON_POSTGRES_URL || // Pooled connection (preferred)
    process.env.NEON_DATABASE_URL || // Generic fallback
    process.env.NEON_DATABASE_URL || // Alternative Neon URL
    process.env.POSTGRES_URL // Generic Postgres URL

  if (!url) {
    throw new Error("Database connection URL not provided. Set NEON_POSTGRES_URL in your environment variables.")
  }

  console.log("🔗 Using database connection:", url.includes("pooler") ? "Pooled" : "Direct")

  // Cache the client across calls
  return (globalThis as any).__SQL_CLIENT__ || ((globalThis as any).__SQL_CLIENT__ = neon(url))
}

export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  booking_reference: string
  tour_id: string
  customer_id: string
  start_date: string
  end_date: string
  adults: number
  children: number
  total_price: number
  deposit_amount: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  tourplan_booking_id?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  booking_id: string
  amount: number
  payment_method: string
  payment_provider: string
  provider_transaction_id: string
  status: "pending" | "paid" | "failed" | "refunded"
  processed_at: string
}

export class DatabaseService {
  // Customer operations
  static async createCustomer(customerData: Omit<Customer, "id" | "created_at" | "updated_at">): Promise<Customer> {
    const result = await getSql()`
      INSERT INTO customers (first_name, last_name, email, phone, address)
      VALUES (${customerData.first_name}, ${customerData.last_name}, ${customerData.email}, ${customerData.phone || null}, ${customerData.address || null})
      RETURNING *
    `
    return result[0] as Customer
  }

  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    const result = await getSql()`
      SELECT * FROM customers WHERE email = ${email} LIMIT 1
    `
    return (result[0] as Customer) || null
  }

  static async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const result = await getSql()`
      UPDATE customers 
      SET 
        first_name = COALESCE(${customerData.first_name}, first_name),
        last_name = COALESCE(${customerData.last_name}, last_name),
        email = COALESCE(${customerData.email}, email),
        phone = COALESCE(${customerData.phone}, phone),
        address = COALESCE(${customerData.address}, address),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Customer
  }

  // Booking operations
  static async createBooking(bookingData: Omit<Booking, "id" | "created_at" | "updated_at">): Promise<Booking> {
    const result = await getSql()`
      INSERT INTO bookings (
        booking_reference, tour_id, customer_id, start_date, end_date, 
        adults, children, total_price, deposit_amount, status, tourplan_booking_id
      )
      VALUES (
        ${bookingData.booking_reference}, ${bookingData.tour_id}, ${bookingData.customer_id},
        ${bookingData.start_date}, ${bookingData.end_date}, ${bookingData.adults}, ${bookingData.children},
        ${bookingData.total_price}, ${bookingData.deposit_amount}, ${bookingData.status}, 
        ${bookingData.tourplan_booking_id || null}
      )
      RETURNING *
    `
    return result[0] as Booking
  }

  static async getBooking(id: string): Promise<Booking | null> {
    const result = await getSql()`
      SELECT * FROM bookings WHERE id = ${id} LIMIT 1
    `
    return (result[0] as Booking) || null
  }

  static async getBookingWithCustomer(id: string): Promise<(Booking & { customer: Customer }) | null> {
    const result = await getSql()`
      SELECT 
        b.*,
        json_build_object(
          'id', c.id,
          'first_name', c.first_name,
          'last_name', c.last_name,
          'email', c.email,
          'phone', c.phone,
          'address', c.address
        ) as customer
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.id = ${id}
      LIMIT 1
    `
    return (result[0] as Booking & { customer: Customer }) || null
  }

  static async updateBookingStatus(id: string, status: Booking["status"]): Promise<Booking> {
    const result = await getSql()`
      UPDATE bookings 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Booking
  }

  static async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    const result = await getSql()`
      SELECT * FROM bookings 
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
    `
    return result as Booking[]
  }

  // Payment operations
  static async createPayment(paymentData: Omit<Payment, "id" | "processed_at">): Promise<Payment> {
    const result = await getSql()`
      INSERT INTO payments (
        booking_id, amount, payment_method, payment_provider, 
        provider_transaction_id, status
      )
      VALUES (
        ${paymentData.booking_id}, ${paymentData.amount}, ${paymentData.payment_method},
        ${paymentData.payment_provider}, ${paymentData.provider_transaction_id}, ${paymentData.status}
      )
      RETURNING *
    `
    return result[0] as Payment
  }

  static async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    const result = await getSql()`
      SELECT * FROM payments 
      WHERE booking_id = ${bookingId}
      ORDER BY processed_at DESC
    `
    return result as Payment[]
  }

  static async updatePaymentStatus(id: string, status: Payment["status"]): Promise<Payment> {
    const result = await getSql()`
      UPDATE payments 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Payment
  }

  // Booking extras
  static async addBookingExtra(bookingId: string, extraId: string, quantity: number, unitPrice: number): Promise<void> {
    await getSql()`
      INSERT INTO booking_extras (booking_id, tour_extra_id, quantity, unit_price)
      VALUES (${bookingId}, ${extraId}, ${quantity}, ${unitPrice})
    `
  }

  static async getBookingExtras(bookingId: string): Promise<any[]> {
    const result = await getSql()`
      SELECT * FROM booking_extras 
      WHERE booking_id = ${bookingId}
    `
    return result as any[]
  }
}
