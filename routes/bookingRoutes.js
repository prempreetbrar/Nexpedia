const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const { getCheckout } = require("../controllers/bookingController");

const router = express.Router();
router.get("/checkout/:tourId", protect, getCheckout);

module.exports = router;
