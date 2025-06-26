/**
 * Payment Client Abstraction
 * Provides a unified interface for payment processing
 * that can use either Stripe or Tyro as the underlying provider
 */

const { PAYMENT_CONFIG, STRIPE_CONFIG, TYRO_CONFIG } = require('../config');

class PaymentClient {
  constructor() {
    this.provider = PAYMENT_CONFIG.PROVIDER;
    this.client = null;
    this._initializeClient();
  }

  _initializeClient() {
    // Initialize the appropriate client based on configuration
    if (this.provider === 'stripe') {
      this.client = require('./stripe/stripeClient');
    } else if (this.provider === 'tyro') {
      // For now, fall back to stripe until tyro integration is complete
      console.warn('Tyro provider requested but not fully implemented, using stripe instead');
      this.provider = 'stripe';
      this.client = require('./stripe/stripeClient');
    } else {
      throw new Error(`Unsupported payment provider: ${this.provider}`);
    }
  }

  /**
   * Create a payment session/checkout
   * @param {Object} paymentDetails - Payment details like amount, currency, etc.
   * @returns {Promise<Object>} Payment session data including redirect URL
   */
  async createPaymentSession(paymentDetails) {
    return this.client.createPaymentSession(paymentDetails);
  }

  /**
   * Process a payment callback (webhook or redirect)
   * @param {Object} callbackData - Data received from payment provider callback
   * @returns {Promise<Object>} Processed payment result
   */
  async processCallback(callbackData) {
    return this.client.processCallback(callbackData);
  }

  /**
   * Verify payment status
   * @param {string} paymentId - ID of the payment to verify
   * @returns {Promise<Object>} Payment status and details
   */
  async verifyPayment(paymentId) {
    return this.client.verifyPayment(paymentId);
  }

  /**
   * Cancel a payment
   * @param {string} paymentId - ID of the payment to cancel
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelPayment(paymentId) {
    return this.client.cancelPayment(paymentId);
  }
}

module.exports = new PaymentClient();
