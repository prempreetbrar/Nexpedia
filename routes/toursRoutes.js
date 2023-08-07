const express = require("express");

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
} = require("../controllers/toursController");

const router = express.Router();
router.route("/").get(protect, getAllTours).post(createTour);
router.route("/top-tours").get(aliasTopTours, getAllTours);
router.route("/tours-stats").get(getTourStatistics);
router.route("/monthly-plan/:year").get(getMonthlyPlan);
router
  .route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
