const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
  }
}

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      uid: user.uid, 
      email: user.email, 
      isAdmin: user.isAdmin 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Firebase Authentication (Google Sign-in)
router.post('/firebase', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Find user by uid OR by email (to handle existing accounts)
    let user = await User.findOne({ uid });
    
    if (!user && email) {
      // Check if user exists with this email (created via email/password signup)
      user = await User.findOne({ email });
    }
    
    if (!user) {
      // Create new user
      user = new User({
        uid,
        email,
        displayName: name || email?.split('@')[0] || 'User',
        photoURL: picture || '',
        isAdmin: false
      });
      await user.save();
      console.log('✅ New user created via Firebase:', email);
    } else {
      // Update existing user with Firebase uid and info
      user.uid = uid; // Link Firebase UID to existing account
      user.email = email || user.email;
      user.displayName = name || user.displayName;
      user.photoURL = picture || user.photoURL;
      await user.save();
      console.log('✅ Existing user linked to Firebase:', email);
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(401).json({ 
      message: 'Authentication failed', 
      error: error.message 
    });
  }
});

// Get current user from JWT
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Create or update user
router.post('/user', async (req, res) => {
  try {
    const { uid, email, displayName, phoneNumber, photoURL } = req.body;

    let user = await User.findOne({ uid });

    if (user) {
      user.email = email || user.email;
      user.displayName = displayName || user.displayName;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.photoURL = photoURL || user.photoURL;
      await user.save();
    } else {
      user = new User({
        uid,
        email,
        displayName,
        phoneNumber,
        photoURL
      });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by UID
router.get('/user/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/user/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { displayName, phoneNumber, photoURL, addresses } = req.body;

    if (displayName) user.displayName = displayName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (photoURL) user.photoURL = photoURL;
    if (addresses) user.addresses = addresses;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
