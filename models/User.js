const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  photoURL: {
    type: String
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'restaurant_owner'],
    default: 'customer'
  },
  addresses: [{
    label: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  favoriteRestaurants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
