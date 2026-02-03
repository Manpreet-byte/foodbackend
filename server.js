const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

dotenv.config();

const app = express();

// ===========================================
// IMPORT MIDDLEWARE
// ===========================================
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, orderLimiter, paymentLimiter } = require('./middleware/rateLimiter');
const { sanitizeQuery } = require('./middleware/validator');

// ===========================================
// CORS CONFIGURATION (VERCEL SAFE)
// ===========================================
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['https://foodbackend-neon.vercel.app/', 'https://food-front-sepia.vercel.app/'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman, server-to-server

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // set true ONLY if using cookies
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ===========================================
// GLOBAL MIDDLEWARE
// ===========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeQuery);

app.set('trust proxy', 1);
app.use(generalLimiter);

// ===========================================
// MONGODB CONNECTION
// ===========================================
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB error:', err);
  process.exit(1);
});

// ===========================================
// SERVICES
// ===========================================
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ===========================================
// MODELS (keep imports so mongoose registers them)
// ===========================================
require('./models/MenuItem');
require('./models/Restaurant');
require('./models/Order');
require('./models/User');
require('./models/Rating');

// ===========================================
// ROUTES
// ===========================================
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menuitems', require('./routes/menuitems'));
app.use('/api/orders', orderLimiter, require('./routes/orders'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', paymentLimiter, require('./routes/payment'));

// ===========================================
// HEALTH CHECK
// ===========================================
app.get('/', (req, res) => {
  res.json({
    message: 'Food Ordering API running 🚀',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/health', (req, res) => {
  res.json({
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ===========================================
// ERROR HANDLING
// ===========================================
app.use(notFoundHandler);
app.use(errorHandler);

// ===========================================
// ✅ VERCEL EXPORT (CRITICAL)
// ===========================================
module.exports = app;
