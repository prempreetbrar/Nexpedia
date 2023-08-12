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
  .get(getAllReviews)
  .post(protect, restrictTo("user"), setTourId, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(protect, restrictTo("user"), updateReview)
  .delete(protect, restrictTo("user"), deleteReview);

module.exports = router;
