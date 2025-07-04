interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

interface Booking {
  id: string
  customerId: string
  tourId: string
  tourName: string
  startDate: string
  endDate: string
  adults: number
  children: number
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed"
  createdAt: Date
  updatedAt: Date
}

interface Payment {
  id: string
  bookingId: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed"
  paymentMethod: string
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}

// Mock database for demo purposes
const mockCustomers: Customer[] = []
const mockBookings: Booking[] = []
const mockPayments: Payment[] = []

export class DatabaseService {
  // Customer operations
  async createCustomer(customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> {
    const customer: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockCustomers.push(customer)
    return customer
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return mockCustomers.find((c) => c.id === id) || null
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    return mockCustomers.find((c) => c.email === email) || null
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const index = mockCustomers.findIndex((c) => c.id === id)
    if (index === -1) return null

    mockCustomers[index] = {
      ...mockCustomers[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockCustomers[index]
  }

  // Booking operations
  async createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<Booking> {
    const booking: Booking = {
      ...bookingData,
      id: `book_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockBookings.push(booking)
    return booking
  }

  async getBooking(id: string): Promise<Booking | null> {
    return mockBookings.find((b) => b.id === id) || null
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return mockBookings.filter((b) => b.customerId === customerId)
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const index = mockBookings.findIndex((b) => b.id === id)
    if (index === -1) return null

    mockBookings[index] = {
      ...mockBookings[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockBookings[index]
  }

  // Payment operations
  async createPayment(paymentData: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> {
    const payment: Payment = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockPayments.push(payment)
    return payment
  }

  async getPayment(id: string): Promise<Payment | null> {
    return mockPayments.find((p) => p.id === id) || null
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return mockPayments.filter((p) => p.bookingId === bookingId)
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const index = mockPayments.findIndex((p) => p.id === id)
    if (index === -1) return null

    mockPayments[index] = {
      ...mockPayments[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockPayments[index]
  }

  // Health check
  async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: "Database connection successful (mock mode)",
    }
  }
}

// Create singleton instance
const db = new DatabaseService()

// Legacy exports for backward compatibility
export async function createCustomer(customerData: any) {
  return db.createCustomer(customerData)
}

export async function getCustomer(id: string) {
  return db.getCustomer(id)
}

export async function getCustomerByEmail(email: string) {
  return db.getCustomerByEmail(email)
}

export async function updateCustomer(id: string, updates: any) {
  return db.updateCustomer(id, updates)
}

export async function createBooking(bookingData: any) {
  return db.createBooking(bookingData)
}

export async function getBooking(id: string) {
  return db.getBooking(id)
}

export async function getBookingsByCustomer(customerId: string) {
  return db.getBookingsByCustomer(customerId)
}

export async function updateBooking(id: string, updates: any) {
  return db.updateBooking(id, updates)
}

export async function createPayment(paymentData: any) {
  return db.createPayment(paymentData)
}

export async function getPayment(id: string) {
  return db.getPayment(id)
}

export async function getPaymentsByBooking(bookingId: string) {
  return db.getPaymentsByBooking(bookingId)
}

export async function updatePayment(id: string, updates: any) {
  return db.updatePayment(id, updates)
}

export async function testDatabaseConnection() {
  return db.testConnection()
}

// Export the singleton instance
export { db }
export default db
