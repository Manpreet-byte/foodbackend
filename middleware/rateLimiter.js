const rateLimit = require('express-rate-limit');

// Store for tracking requests (in production, use Redis)
const requestCounts = new Map();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.startTime > 60000) { // 1 minute
      requestCounts.delete(key);
    }
  }
}, 60000);

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default key generator (handles IPv6 properly)
  validate: { xForwardedForHeader: false }
});

// Strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  validate: { xForwardedForHeader: false }
});

// Rate limiter for order creation
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 orders per minute
  message: {
    success: false,
    message: 'Too many order requests, please wait a moment',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
});

// Rate limiter for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 payment requests per minute
  message: {
    success: false,
    message: 'Too many payment requests, please wait',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
});

// Custom rate limiter for specific routes (no external dependency)
const createCustomLimiter = (options = {}) => {
  const {
    windowMs = 60000, // 1 minute default
    max = 100, // 100 requests default
    message = 'Too many requests'
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, startTime: now });
      return next();
    }

    const data = requestCounts.get(key);

    if (now - data.startTime > windowMs) {
      // Reset window
      requestCounts.set(key, { count: 1, startTime: now });
      return next();
    }

    data.count++;

    if (data.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((windowMs - (now - data.startTime)) / 1000)
      });
    }

    next();
  };
};

// Speed limiter - slows down responses after certain threshold
const speedLimiter = (options = {}) => {
  const {
    windowMs = 60000,
    delayAfter = 50,
    delayMs = 500
  } = options;

  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const data = requestCounts.get(key);

    if (data && data.count > delayAfter) {
      const delay = Math.min((data.count - delayAfter) * delayMs, 5000);
      return setTimeout(next, delay);
    }

    next();
  };
};

module.exports = {
  generalLimiter,
  authLimiter,
  orderLimiter,
  paymentLimiter,
  createCustomLimiter,
  speedLimiter
};
