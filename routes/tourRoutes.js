const express = require("express");
const reviewRouter = require("./reviewRoutes");

const { protect, restrictTo } = require("../controllers/authController");
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStatistics,
  getMonthlyPlan,
} = require("../controllers/tourController");

const router = express.Router();
router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);
router.route("/top-tours").get(aliasTopTours, getAllTours);
router.route("/tours-stats").get(getTourStatistics);
router
  .route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);
router
  .route("/:id")
  .get(getTour)
  .patch(protect, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);
router.use("/:tourId/reviews", reviewRouter);

module.exports = router;
