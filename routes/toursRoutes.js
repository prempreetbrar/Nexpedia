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
} = require("../controllers/toursController");

const router = express.Router();
router.route("/").get(getAllTours).post(createTour);
router.route("/top-tours").get(aliasTopTours, getAllTours);
router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
