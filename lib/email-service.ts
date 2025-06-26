import nodemailer from "nodemailer"

interface BookingConfirmationEmailOptions {
  to: string
  bookingId: string
  customerName: string
  tourName: string
  bookingDate: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  async sendBookingConfirmationEmail(options: BookingConfirmationEmailOptions): Promise<void> {
    const { to, bookingId, customerName, tourName, bookingDate } = options

    const bookingUrl = `https://book.thisisafrica.com.au/booking/${bookingId}`

    const mailOptions = {
      from: "bookings@thisisafrica.com.au",
      to: to,
      subject: "Booking Confirmation",
      html: `
        <p>Dear ${customerName},</p>
        <p>Your booking for ${tourName} on ${bookingDate} has been confirmed.</p>
        <p>You can view your booking details at: <a href="${bookingUrl}">${bookingUrl}</a></p>
        <p>Thank you for booking with us!</p>
      `,
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log("Booking confirmation email sent successfully!")
    } catch (error) {
      console.error("Error sending booking confirmation email:", error)
      throw error
    }
  }
}
