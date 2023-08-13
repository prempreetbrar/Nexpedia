const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  setTourId,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
} = require("../controllers/reviewController");

const router = express.Router({ mergeParams: true });
router
  .route("/")
  .get(setTourId, getAllReviews)
  .post(protect, restrictTo("user"), setTourId, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(protect, restrictTo("user", "admin"), updateReview)
  .delete(protect, restrictTo("user", "admin"), deleteReview);

module.exports = router;
