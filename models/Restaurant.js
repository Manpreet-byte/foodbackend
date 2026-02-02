const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    default: ''
  },
  history: {
    type: String,
    default: ''
  },
  foundedYear: {
    type: Number
  },
  founderName: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Restaurant'
  },
  coverImage: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  gallery: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  deliveryTime: {
    type: String,
    default: '30-45 mins'
  },
  minOrder: {
    type: Number,
    default: 200
  },
  deliveryFee: {
    type: Number,
    default: 40
  },
  cuisineType: {
    type: [String],
    default: []
  },
  specialties: {
    type: [String],
    default: []
  },
  features: {
    type: [String],
    default: []
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  hours: {
    type: String,
    default: '10:00 AM - 11:00 PM'
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  awards: [{
    title: { type: String },
    year: { type: Number },
    organization: { type: String }
  }],
  certifications: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
