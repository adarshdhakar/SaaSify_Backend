const express = require("express");
const router = express.Router({mergeParams: true});
const userController = require("../controllers/user.js");

router
    .route("/signup")
    .get(userController.renderSignupPage)
    .post(userController.renderSignupPage);

module.exports = router;