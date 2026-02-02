const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Food+Item'
  },
  // Multiple images gallery
  imageGallery: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    isVideo: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    enum: ['Pizza', 'Burger', 'Pasta', 'Dessert', 'Drinks', 'Appetizer', 'Main Course', 'Salad', 'Soup', 'Sides'],
    default: 'Main Course'
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  // Additional details for modal
  isVeg: {
    type: Boolean,
    default: false
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  spicyLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  preparationTime: {
    type: Number, // in minutes
    default: 20
  },
  ingredients: [{
    type: String
  }],
  allergens: [{
    type: String
  }],
  nutritionalInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 }
  },
  tags: [{
    type: String
  }],
  // For offers
  originalPrice: {
    type: Number
  },
  discount: {
    type: Number,
    default: 0
  },
  // Customization options
  customizations: [{
    name: { type: String },
    options: [{
      label: { type: String },
      price: { type: Number, default: 0 }
    }],
    required: { type: Boolean, default: false },
    multiSelect: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Virtual for discounted price
menuItemSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0 && this.originalPrice) {
    return this.price;
  }
  return null;
});

// Virtual to check if item has discount
menuItemSchema.virtual('hasDiscount').get(function() {
  return this.discount > 0 && this.originalPrice > this.price;
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
