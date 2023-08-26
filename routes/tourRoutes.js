const express = require("express");
const reviewRouter = require("./reviewRoutes");

const { protect, restrictTo } = require("../controllers/authController");
const {
  getToursWithin,
  getDistances,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStatistics,
  getMonthlyPlan,
  uploadTourImages,
  resizeTourImages,
} = require("../controllers/tourController");

const router = express.Router();

router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);

router.route("/top-tours").get(aliasTopTours, getAllTours);
router.route("/tours-stats").get(getTourStatistics);
router.get(
  "/tours-within/:distance/center/:latitudeLongitude/unit/:unit",
  getToursWithin
);
router.get("/distances/:latitudeLongitude/unit/:unit", getDistances);

router
  .route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

router
  .route("/:id")
  .get(getTour)
  .patch(
    protect,
    restrictTo("admin", "lead-guide"),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

router.use("/:tourId/reviews", reviewRouter);

module.exports = router;
