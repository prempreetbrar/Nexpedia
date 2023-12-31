const express = require("express");
const {
  getOverview,
  getTour,
  getLogin,
  getAccount,
  getResetPassword,
  getForgotPassword,
  getMyTours,
  getSignup,
  alertHandler,
} = require("../controllers/viewController");
const { isLoggedIn, protect } = require("../controllers/authController");

const router = express.Router();

router.use(alertHandler);
router.get("/me", protect, getAccount);
router.get("/me/bookings", protect, getMyTours);
router.use(isLoggedIn);
router.get("/", getOverview);
router.get("/signup", getSignup);
router.get("/login", getLogin);
router.get("/tours/:slug", getTour);
router.get("/resetPassword/:email/:resetToken", getResetPassword);
router.get("/forgotPassword/", getForgotPassword);

module.exports = router;
