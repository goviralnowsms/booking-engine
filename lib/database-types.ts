export interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Tour {
  id: string
  tourplan_product_id: string
  name: string
  description?: string
  supplier_id?: string
  supplier_name?: string
  category?: string
  duration_days?: number
  base_price?: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  customer_id: string
  tour_id: string
  tourplan_booking_id?: string
  tourplan_confirmation_number?: string
  booking_date: string
  number_of_adults: number
  number_of_children: number
  total_amount: number
  currency: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  stripe_payment_intent_id?: string
  stripe_charge_id?: string
  special_requirements?: string
  created_at: string
  updated_at: string
}

export interface BookingItem {
  id: string
  booking_id: string
  item_type: string
  item_name: string
  item_date?: string
  quantity: number
  unit_price: number
  total_price: number
  tourplan_item_id?: string
  created_at: string
}

export interface PaymentTransaction {
  id: string
  booking_id: string
  amount: number
  currency: string
  payment_method?: string
  stripe_payment_intent_id?: string
  stripe_charge_id?: string
  stripe_status?: string
  status: "pending" | "completed" | "failed" | "refunded"
  transaction_type: "payment" | "refund" | "partial_refund"
  metadata?: Record<string, any>
  created_at: string
}
