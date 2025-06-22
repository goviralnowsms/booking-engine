import { PaymentService } from "@/lib/payment-service"

export async function POST(request: Request) {
  try {
    const paymentData = await request.json()
    const { bookingId, amount, currency, paymentType, paymentMethod, customerEmail } = paymentData

    const paymentResult = await PaymentService.processPayment({
      bookingId,
      amount,
      currency,
      paymentType,
      paymentMethod,
      customerEmail,
    })

    if (!paymentResult.success) {
      return Response.json(
        {
          error: "Payment failed",
          details: paymentResult.error,
        },
        { status: 400 },
      )
    }

    return Response.json({
      success: true,
      paymentId: paymentResult.paymentId,
      transactionId: paymentResult.transactionId,
      message: "Payment processed successfully",
    })
  } catch (error) {
    console.error("Payment processing failed:", error)
    return Response.json(
      {
        error: "Payment processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
