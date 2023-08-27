const express = require("express");
const {
  getOverview,
  getTour,
  getLogin,
  getAccount,
  getResetPassword,
} = require("../controllers/viewController");
const { isLoggedIn, protect } = require("../controllers/authController");

const router = express.Router();

router.get("/me", protect, getAccount);
router.use(isLoggedIn);
router.get("/", getOverview);
router.get("/login", getLogin);
router.get("/tours/:slug", getTour);
router.get("/resetPassword/:email/:resetToken", getResetPassword);

module.exports = router;
