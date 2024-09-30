// routes/auth.js
const express = require("express");
const router = express.Router();
const multer = require('multer');
const passport = require("passport");
const crypto = require('crypto'); // For generating OTP
const bcrypt = require('bcrypt'); // For password hashing
const User = require('../models/user.js');
const { sendOTP } = require('../emailConfig'); // Import the sendOTP function
const uploadImage = require('../uploadImage'); // For profile image uploads

// Configure multer to handle image files with validation
const storage = multer.memoryStorage(); // Store image in memory
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 * 2 }, // Limit to 2MB
});

// User registration with OTP
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    // Create user with OTP details (but don't activate yet)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false, // Add isVerified flag
    });

    await newUser.save();

    // Send OTP to user's email
    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent to email for verification' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

// OTP verification route for completing registration
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    if (user.otp !== otp || Date.now() > user.otpExpires) {
      user.otp = null; // Clear expired OTP
      user.otpExpires = null;
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid, clear OTP fields and activate the account
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();

    // Automatically log in the user after successful OTP verification
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login after OTP verification failed', err });
      res.status(200).json({ message: 'OTP verified, logged in successfully', user });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

// Resend OTP route
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!user.otp) return res.status(400).json({ message: 'No pending OTP verification' });

    // Generate a new OTP and send it
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error resending OTP', err });
  }
});

// Login route using Passport.js local strategy
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login failed', err });
      res.status(200).json({ message: 'Logged in successfully', user });
    });
  })(req, res, next);
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err); // Log the error for debugging
      return res.status(500).json({ message: 'Logout failed', err });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Profile image upload route
router.post('/upload-image', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Upload image to cloud service
    const imageUrl = await uploadImage(req.file);

    // Update the user's profile image
    req.user.profileImage = imageUrl;
    await req.user.save();

    res.status(200).json({ message: 'Profile image updated', imageUrl });
  } catch (err) {
    console.error('Image upload error:', err); // Log the error for debugging
    res.status(500).json({ message: 'Image upload failed', err });
  }
});

module.exports = router;
