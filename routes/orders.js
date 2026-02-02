const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const axios = require('axios');

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS
  }
});

// Send SMS via TextBelt
async function sendSMS(phoneNumber, message) {
  try {
    const response = await axios.post('https://textbelt.com/text', {
      phone: phoneNumber,
      message: message,
      key: 'textbelt'
    });
    
    if (response.data.success) {
      console.log(`\n✅ ===== SMS SENT SUCCESSFULLY =====`);
      console.log(`To: ${phoneNumber}`);
      console.log(`Quota remaining: ${response.data.quotaRemaining}`);
      console.log(`=====================================\n`);
    } else {
      console.log(`\n❌ TextBelt Error: ${response.data.error}`);
      console.log(`Quota: ${response.data.quotaRemaining}\n`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`\n❌ ===== SMS SENDING FAILED =====`);
    console.error(`To: ${phoneNumber}`);
    console.error(`Error: ${error.message}`);
    console.error(`==============================\n`);
    return { success: false, error: error.message };
  }
}

// Send Email
async function sendEmail(to, subject, text) {
  try {
    const info = await emailTransporter.sendMail({
      from: `"Food Ordering" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
      to,
      subject,
      text
    });
    
    console.log(`\n✅ ===== EMAIL SENT SUCCESSFULLY =====`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message ID: ${info.messageId}`);
    console.log(`======================================\n`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`\n❌ ===== EMAIL SENDING FAILED =====`);
    console.error(`To: ${to}`);
    console.error(`Error: ${error.message}`);
    console.error(`===================================\n`);
    return { success: false, error: error.message };
  }
}

// Create order
router.post('/', async (req, res) => {
  try {
    const { userId, items, restaurant, totalPrice, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Generate order number
    const orderNumber = '#' + Math.random().toString(36).substr(2, 8).toUpperCase();

    const order = new Order({
      user: userId,
      orderNumber,
      items,
      restaurant,
      totalPrice,
      deliveryAddress,
      paymentMethod,
      specialInstructions,
      status: 'pending',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      deliveryTime: '30-45 mins'
    });

    await order.save();

    // Populate order details
    await order.populate('user restaurant items.menuItem');

    // Send notifications
    const user = await User.findById(userId);
    
    if (user) {
      // Send SMS
      if (user.phoneNumber) {
        const smsMessage = `Your order ${orderNumber} has been placed successfully! Total: ₹${totalPrice}. We'll notify you when it's on the way.`;
        await sendSMS(user.phoneNumber, smsMessage);
      }

      // Send Email
      if (user.email) {
        const emailSubject = `Order Confirmation - ${orderNumber}`;
        const emailText = `
Dear ${user.displayName || 'Customer'},

Your order has been placed successfully!

Order Number: ${orderNumber}
Total Amount: ₹${totalPrice}
Payment Method: ${paymentMethod}
Estimated Delivery: ${order.deliveryTime}

Items:
${items.map(item => `- ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`).join('\n')}

Delivery Address:
${deliveryAddress.address}

Thank you for ordering with us!

Best regards,
Food Ordering Team
        `;
        await sendEmail(user.email, emailSubject, emailText);
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user's orders (requires auth header)
router.get('/my-orders', async (req, res) => {
  try {
    // Get userId from Authorization header (Firebase token or JWT)
    const authHeader = req.headers.authorization;
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Try to decode JWT
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.id || decoded.userId || decoded._id;
      } catch (e) {
        // If JWT fails, try Firebase
        try {
          const admin = require('firebase-admin');
          const decodedToken = await admin.auth().verifyIdToken(token);
          const User = require('../models/User');
          const user = await User.findOne({ uid: decodedToken.uid });
          if (user) userId = user._id;
        } catch (fbError) {
          console.log('Token verification failed:', fbError.message);
        }
      }
    }
    
    // Also check for userId in query params as fallback
    if (!userId && req.query.userId) {
      userId = req.query.userId;
    }
    
    if (!userId) {
      return res.json([]); // Return empty array if no user
    }
    
    const orders = await Order.find({ user: userId })
      .populate('restaurant items.menuItem')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.json([]); // Return empty array on error to prevent frontend crash
  }
});

// Get orders by user
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate('restaurant items.menuItem')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user restaurant items.menuItem');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Send notification on status change
    if (order.user) {
      const statusMessages = {
        confirmed: 'Your order has been confirmed!',
        preparing: 'Your order is being prepared.',
        out_for_delivery: 'Your order is out for delivery!',
        delivered: 'Your order has been delivered. Enjoy your meal!',
        cancelled: 'Your order has been cancelled.'
      };

      const message = `Order ${order.orderNumber}: ${statusMessages[status]}`;

      // Send SMS
      if (order.user.phoneNumber) {
        await sendSMS(order.user.phoneNumber, message);
      }

      // Send Email
      if (order.user.email) {
        await sendEmail(
          order.user.email,
          `Order ${order.orderNumber} - Status Update`,
          message
        );
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders (admin)
router.get('/', async (req, res) => {
  try {
    const { status, restaurant } = req.query;
    let query = {};

    if (status) query.status = status;
    if (restaurant) query.restaurant = restaurant;

    const orders = await Order.find(query)
      .populate('user restaurant items.menuItem')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
