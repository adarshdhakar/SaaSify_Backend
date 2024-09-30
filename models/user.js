// models/user.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String, // URL for the profile image
    default: 'https://via.placeholder.com/150', // Default placeholder image
  },
  otp: {
    type: String, // OTP for email verification
  },
  otpExpires: {
    type: Date, // Expiration time for OTP
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to hash password before saving the user
UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next(); // Only hash if password has changed

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to authenticate user passwords
UserSchema.methods.authenticate = function (password, callback) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
