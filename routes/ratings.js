const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// Create rating
router.post('/', async (req, res) => {
  try {
    const { user, restaurant, menuItem, order, rating, comment } = req.body;

    const newRating = new Rating({
      user,
      restaurant,
      menuItem,
      order,
      rating,
      comment
    });

    await newRating.save();

    // Update restaurant rating if restaurant is rated
    if (restaurant) {
      const ratings = await Rating.find({ restaurant });
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      
      await Restaurant.findByIdAndUpdate(restaurant, {
        rating: avgRating.toFixed(1),
        numReviews: ratings.length
      });
    }

    // Update menu item rating if menu item is rated
    if (menuItem) {
      const ratings = await Rating.find({ menuItem });
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      
      await MenuItem.findByIdAndUpdate(menuItem, {
        rating: avgRating.toFixed(1),
        numReviews: ratings.length
      });
    }

    res.status(201).json(newRating);
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get average ratings stats
router.get('/average', async (req, res) => {
  try {
    const ratings = await Rating.find({});
    
    if (ratings.length === 0) {
      return res.json({ average: 0, total: 0 });
    }
    
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    res.json({
      average: parseFloat(avgRating.toFixed(1)),
      total: ratings.length
    });
  } catch (error) {
    console.error('Get average ratings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get ratings for restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const ratings = await Rating.find({ restaurant: req.params.restaurantId })
      .populate('user', 'displayName photoURL')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    console.error('Get restaurant ratings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get ratings for menu item
router.get('/menuitem/:menuItemId', async (req, res) => {
  try {
    const ratings = await Rating.find({ menuItem: req.params.menuItemId })
      .populate('user', 'displayName photoURL')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    console.error('Get menu item ratings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get ratings by user
router.get('/user/:userId', async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.params.userId })
      .populate('restaurant menuItem')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
