const express = require("express");
const {
  getOverview,
  getTour,
  getLogin,
  getAccount,
  getResetPassword,
  getForgotPassword,
} = require("../controllers/viewController");
const { createBookingCheckout } = require("../controllers/bookingController");
const { isLoggedIn, protect } = require("../controllers/authController");

const router = express.Router();

router.get("/me", protect, getAccount);
router.use(isLoggedIn);
router.get("/", createBookingCheckout, getOverview);
router.get("/login", getLogin);
router.get("/tours/:slug", getTour);
router.get("/resetPassword/:email/:resetToken", getResetPassword);
router.get("/forgotPassword/", getForgotPassword);

module.exports = router;
