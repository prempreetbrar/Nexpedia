const express = require("express");
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody,
  aliasTopTours,
  getTourStatistics,
  getMonthlyPlan,
} = require("../controllers/toursController");

const router = express.Router();
router.route("/").get(getAllTours).post(createTour);
router.route("/top-tours").get(aliasTopTours, getAllTours);
router.route("/tours-stats").get(getTourStatistics);
router.route("/monthly-plan/:year").get(getMonthlyPlan);
router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
