const express = require("express");
const router = express.Router({mergeParams: true});
const authController = require("../controllers/auth.js");

router
    .route("/signup")
    .get(authController.renderSignupPage)
    .post(authController.registerUser);

module.exports = router;