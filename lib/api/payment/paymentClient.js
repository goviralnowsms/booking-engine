/**
 * Payment Client Abstraction
 * Provides a unified interface for payment processing
 * that can use either Stripe or Tyro as the underlying provider
 */

const { PAYMENT_CONFIG, STRIPE_CONFIG, TYRO_CONFIG } = require("../config")
const stripeClient = require("./stripe/stripeClient")
const tyroClient = require("../tyro/tyroClient")

class PaymentClient {
  constructor() {
    this.provider = PAYMENT_CONFIG.PROVIDER

    // Initialize the appropriate client based on configuration
    if (this.provider === "stripe") {
      this.client = stripeClient
    } else if (this.provider === "tyro") {
      this.client = tyroClient
    } else {
      throw new Error(`Unsupported payment provider: ${this.provider}`)
    }
  }

  /**
   * Create a payment session/checkout
   * @param {Object} paymentDetails - Payment details like amount, currency, etc.
   * @returns {Promise<Object>} Payment session data including redirect URL
   */
  async createPaymentSession(paymentDetails) {
    return this.client.createPaymentSession(paymentDetails)
  }

  /**
   * Process a payment callback (webhook or redirect)
   * @param {Object} callbackData - Data received from payment provider callback
   * @returns {Promise<Object>} Processed payment result
   */
  async processCallback(callbackData) {
    return this.client.processCallback(callbackData)
  }

  /**
   * Verify payment status
   * @param {string} paymentId - ID of the payment to verify
   * @returns {Promise<Object>} Payment status and details
   */
  async verifyPayment(paymentId) {
    return this.client.verifyPayment(paymentId)
  }

  /**
   * Cancel a payment
   * @param {string} paymentId - ID of the payment to cancel
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelPayment(paymentId) {
    return this.client.cancelPayment(paymentId)
  }
}

module.exports = new PaymentClient()
