const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

dotenv.config();

const app = express();

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, orderLimiter, paymentLimiter } = require('./middleware/rateLimiter');
const { sanitizeQuery } = require('./middleware/validator');

// ===========================================
// CORS CONFIGURATION (Production Ready)
// ===========================================
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ===========================================
// SECURITY & PARSING MIDDLEWARE
// ===========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeQuery); // Sanitize inputs

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Apply general rate limiter to all routes
app.use(generalLimiter);

// ===========================================
// MONGODB CONNECTION
// ===========================================
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, mongoOptions)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Twilio Configuration
const twilioClient = process.env.TWILIO_ACCOUNT_SID && 
                     process.env.TWILIO_AUTH_TOKEN && 
                     process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Email Configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASS
  }
});

// Log service status
console.log('✅ TextBelt FREE SMS service enabled (no account needed)');
console.log(`✅ Email service initialized (Custom SMTP: ${process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com'})`);

// Import Models
const MenuItem = require('./models/MenuItem');
const Restaurant = require('./models/Restaurant');
const Order = require('./models/Order');
const User = require('./models/User');
const Rating = require('./models/Rating');

// ===========================================
// ROUTES WITH RATE LIMITING
// ===========================================
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menuitems', require('./routes/menuitems'));
app.use('/api/orders', orderLimiter, require('./routes/orders'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', paymentLimiter, require('./routes/payment'));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Food Ordering API is running!',
    version: '1.0.0',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.json(healthCheck);
});

// ===========================================
// ERROR HANDLING
// ===========================================
// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);
});
