const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
const userValidation = {
  create: [
    body('uid')
      .notEmpty().withMessage('UID is required')
      .isString().withMessage('UID must be a string'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('displayName')
      .optional()
      .isString().withMessage('Display name must be a string')
      .isLength({ min: 2, max: 50 }).withMessage('Display name must be 2-50 characters')
      .trim()
      .escape(),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[1-9]\d{9,14}$/).withMessage('Invalid phone number format'),
    validate
  ],
  
  update: [
    param('uid')
      .notEmpty().withMessage('UID is required'),
    body('displayName')
      .optional()
      .isString().withMessage('Display name must be a string')
      .isLength({ min: 2, max: 50 }).withMessage('Display name must be 2-50 characters')
      .trim()
      .escape(),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[1-9]\d{9,14}$/).withMessage('Invalid phone number format'),
    body('addresses')
      .optional()
      .isArray().withMessage('Addresses must be an array'),
    validate
  ]
};

// Order validation rules
const orderValidation = {
  create: [
    body('items')
      .isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.menuItem')
      .notEmpty().withMessage('Menu item ID is required'),
    body('items.*.quantity')
      .isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
    body('totalAmount')
      .isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
    body('address')
      .notEmpty().withMessage('Delivery address is required')
      .isString().withMessage('Address must be a string')
      .isLength({ min: 10, max: 500 }).withMessage('Address must be 10-500 characters')
      .trim(),
    body('phone')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^\+?[1-9]\d{9,14}$/).withMessage('Invalid phone number format'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('paymentMethod')
      .notEmpty().withMessage('Payment method is required')
      .isIn(['cash', 'card', 'upi', 'online']).withMessage('Invalid payment method'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    validate
  ],

  updateStatus: [
    param('id')
      .isMongoId().withMessage('Invalid order ID'),
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
    validate
  ]
};

// Restaurant validation rules
const restaurantValidation = {
  create: [
    body('name')
      .notEmpty().withMessage('Restaurant name is required')
      .isString().withMessage('Name must be a string')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
      .trim()
      .escape(),
    body('address')
      .notEmpty().withMessage('Address is required')
      .isString().withMessage('Address must be a string')
      .isLength({ min: 10, max: 300 }).withMessage('Address must be 10-300 characters')
      .trim(),
    body('phone')
      .optional()
      .matches(/^\+?[1-9]\d{9,14}$/).withMessage('Invalid phone number format'),
    body('cuisine')
      .optional()
      .isArray().withMessage('Cuisine must be an array'),
    body('rating')
      .optional()
      .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    validate
  ]
};

// Menu item validation rules
const menuItemValidation = {
  create: [
    body('name')
      .notEmpty().withMessage('Item name is required')
      .isString().withMessage('Name must be a string')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
      .trim()
      .escape(),
    body('price')
      .notEmpty().withMessage('Price is required')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('description')
      .optional()
      .isString().withMessage('Description must be a string')
      .isLength({ max: 500 }).withMessage('Description must be under 500 characters')
      .trim(),
    body('category')
      .optional()
      .isString().withMessage('Category must be a string')
      .trim(),
    body('restaurant')
      .notEmpty().withMessage('Restaurant ID is required')
      .isMongoId().withMessage('Invalid restaurant ID'),
    body('available')
      .optional()
      .isBoolean().withMessage('Available must be true or false'),
    validate
  ]
};

// Rating validation rules
const ratingValidation = {
  create: [
    body('rating')
      .notEmpty().withMessage('Rating is required')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isString().withMessage('Comment must be a string')
      .isLength({ max: 1000 }).withMessage('Comment must be under 1000 characters')
      .trim()
      .escape(),
    body('orderId')
      .optional()
      .isMongoId().withMessage('Invalid order ID'),
    body('restaurantId')
      .optional()
      .isMongoId().withMessage('Invalid restaurant ID'),
    validate
  ]
};

// Payment validation rules
const paymentValidation = {
  createOrder: [
    body('amount')
      .notEmpty().withMessage('Amount is required')
      .isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('currency')
      .optional()
      .isIn(['INR', 'USD', 'EUR']).withMessage('Invalid currency'),
    validate
  ],

  verify: [
    body('razorpay_order_id')
      .notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpay_payment_id')
      .notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpay_signature')
      .notEmpty().withMessage('Razorpay signature is required'),
    validate
  ],

  refund: [
    body('paymentId')
      .notEmpty().withMessage('Payment ID is required'),
    body('amount')
      .optional()
      .isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    validate
  ]
};

// Common param validators
const paramValidation = {
  mongoId: [
    param('id')
      .isMongoId().withMessage('Invalid ID format'),
    validate
  ],
  
  userId: [
    param('userId')
      .isMongoId().withMessage('Invalid user ID format'),
    validate
  ]
};

// Query sanitization
const sanitizeQuery = (req, res, next) => {
  // Remove potential NoSQL injection patterns
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/[${}]/g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.query);
  sanitize(req.body);
  next();
};

module.exports = {
  validate,
  userValidation,
  orderValidation,
  restaurantValidation,
  menuItemValidation,
  ratingValidation,
  paymentValidation,
  paramValidation,
  sanitizeQuery
};
