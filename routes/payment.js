const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');

// Razorpay SDK (if installed) or direct API calls
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.log('Razorpay SDK not installed. Using direct API calls.');
}

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  
  if (Razorpay) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return null;
};

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount' 
      });
    }

    const razorpay = getRazorpayInstance();
    
    if (!razorpay) {
      // Return test mode response if Razorpay not configured
      return res.json({
        success: true,
        testMode: true,
        order: {
          id: 'order_test_' + Date.now(),
          amount: amount * 100,
          currency,
          receipt: receipt || `receipt_${Date.now()}`
        },
        key: 'rzp_test_placeholder',
        message: 'Test mode - Razorpay not configured'
      });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order',
      error: error.message 
    });
  }
});

// Verify Razorpay Payment
router.post('/verify', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId // Our internal order ID
    } = req.body;

    // Test mode verification
    if (razorpay_order_id?.startsWith('order_test_')) {
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          paymentId: razorpay_payment_id || 'test_payment_' + Date.now()
        });
      }
      return res.json({
        success: true,
        testMode: true,
        message: 'Test payment verified'
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification not configured'
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update order payment status
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          paymentId: razorpay_payment_id
        });
      }

      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification error',
      error: error.message
    });
  }
});

// Razorpay Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.log('Webhook secret not configured');
      return res.status(200).json({ received: true });
    }

    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = body.event;
    const payload = body.payload;

    switch (event) {
      case 'payment.captured':
        console.log('Payment captured:', payload.payment.entity.id);
        // Update order status
        const paymentId = payload.payment.entity.id;
        const orderId = payload.payment.entity.notes?.orderId;
        
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            paymentId
          });
        }
        break;

      case 'payment.failed':
        console.log('Payment failed:', payload.payment.entity.id);
        const failedOrderId = payload.payment.entity.notes?.orderId;
        
        if (failedOrderId) {
          await Order.findByIdAndUpdate(failedOrderId, {
            paymentStatus: 'failed'
          });
        }
        break;

      case 'refund.processed':
        console.log('Refund processed:', payload.refund.entity.id);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get Payment Status
router.get('/status/:paymentId', async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    
    if (!razorpay) {
      return res.status(400).json({
        success: false,
        message: 'Payment gateway not configured'
      });
    }

    const payment = await razorpay.payments.fetch(req.params.paymentId);

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        created_at: payment.created_at
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message
    });
  }
});

// Initiate Refund
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    const razorpay = getRazorpayInstance();
    
    if (!razorpay) {
      return res.status(400).json({
        success: false,
        message: 'Payment gateway not configured'
      });
    }

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined, // Full refund if no amount
      notes: { reason: reason || 'Customer requested refund' }
    });

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        payment_id: refund.payment_id
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund failed',
      error: error.message
    });
  }
});

module.exports = router;
