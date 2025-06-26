"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface BookingEmailData {
  customerEmail: string
  customerName: string
  bookingReference: string
  tourName: string
  startDate: string
  totalPrice: number
  depositAmount: number
  finalPaymentDue?: string
}

export class EmailService {
  static async sendBookingConfirmation(data: BookingEmailData) {
    try {
      const { data: result, error } = await resend.emails.send({
        from: "your-verified-email@example.com",
        to: [data.customerEmail],
        subject: `Booking Confirmation - ${data.bookingReference}`,
        html: this.getBookingConfirmationTemplate(data),
      })

      if (error) {
        console.error("Failed to send booking confirmation:", error)
        return false
      }

      console.log("Booking confirmation sent:", result)
      return true
    } catch (error) {
      console.error("Email service error:", error)
      return false
    }
  }

  static async sendPaymentReminder(data: BookingEmailData) {
    try {
      const { data: result, error } = await resend.emails.send({
        from: "your-verified-email@example.com",
        to: [data.customerEmail],
        subject: `Payment Reminder - ${data.bookingReference}`,
        html: this.getPaymentReminderTemplate(data),
      })

      if (error) {
        console.error("Failed to send payment reminder:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Payment reminder error:", error)
      return false
    }
  }

  static async sendAdminNotification(data: BookingEmailData) {
    try {
      const { data: result, error } = await resend.emails.send({
        from: "your-verified-email@example.com",
        to: ["your-admin-email@example.com"],
        subject: `New Booking - ${data.bookingReference}`,
        html: this.getAdminNotificationTemplate(data),
      })

      return !!result
    } catch (error) {
      console.error("Admin notification error:", error)
      return false
    }
  }

  private static getBookingConfirmationTemplate(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Dear ${data.customerName},</h2>
            <p>Thank you for booking with This Is Africa! Your booking has been confirmed.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
              <p><strong>Tour:</strong> ${data.tourName}</p>
              <p><strong>Start Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
              <p><strong>Total Price:</strong> $${data.totalPrice}</p>
              <p><strong>Deposit Paid:</strong> $${data.depositAmount}</p>
              ${data.finalPaymentDue ? `<p><strong>Final Payment Due:</strong> ${new Date(data.finalPaymentDue).toLocaleDateString()}</p>` : ""}
            </div>

            <p>We'll send you a payment reminder closer to your departure date.</p>
            
            <a href="https://thisisafrica.com.au/booking/${data.bookingReference}" class="button">View Booking Details</a>
          </div>
          <div class="footer">
            <p>This Is Africa Tours<br>
            Email: info@thisisafrica.com.au<br>
            Phone: +1 555-123-4567</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static getPaymentReminderTemplate(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
          </div>
          <div class="content">
            <h2>Dear ${data.customerName},</h2>
            <p>This is a friendly reminder that your final payment is due soon for your upcoming tour.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
              <p><strong>Tour:</strong> ${data.tourName}</p>
              <p><strong>Start Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
              <p><strong>Outstanding Balance:</strong> $${data.totalPrice - data.depositAmount}</p>
              ${data.finalPaymentDue ? `<p><strong>Payment Due:</strong> ${new Date(data.finalPaymentDue).toLocaleDateString()}</p>` : ""}
            </div>

            <p>Please complete your payment to secure your booking.</p>
            
            <a href="https://thisisafrica.com.au/payment/${data.bookingReference}" class="button">Pay Now</a>
          </div>
          <div class="footer">
            <p>This Is Africa Tours<br>
            Email: info@thisisafrica.com.au<br>
            Phone: +1 555-123-4567</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static getAdminNotificationTemplate(data: BookingEmailData): string {
    return `
      <h2>New Booking Received</h2>
      <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
      <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
      <p><strong>Tour:</strong> ${data.tourName}</p>
      <p><strong>Start Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
      <p><strong>Total Price:</strong> $${data.totalPrice}</p>
      <p><strong>Deposit:</strong> $${data.depositAmount}</p>
      
      <p><a href="https://thisisafrica.com.au/admin/bookings/${data.bookingReference}">View in Admin Panel</a></p>
    `
  }
}
