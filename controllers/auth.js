const multer = require('multer');
const uploadImage = require('../uploadImage'); 
const { sendOTP } = require('../emailConfig'); // Import the sendOTP function
const crypto = require('crypto'); // For generating OTP

// Configure multer to handle image files
const storage = multer.memoryStorage(); // Store image in memory
const upload = multer({ storage });

module.exports.renderSignupPage = (req, res) => {
    res.send("Signup Form");
    // res.render("users/signup.ejs");
};

module.exports.registerUser = (req, res) => {
    res.send("Register User post request");
};
