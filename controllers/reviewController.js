const Review = require("../models/reviewModel");
const factory = require("./controllerFactory");

exports.setTourId = (request, response, next) => {
  // not all the variables set in this function will be used; we use this
  // function in a variety of places, each of which use only a subset of all
  // the variables assigned here.
  request.body.filter = request.params.tourId
    ? { tour: request.params.tourId }
    : {};
  request.body.tour = request.body.tour || request.params.tourId;
  request.body.user = request.user;
  next();
};

exports.createReview = factory.createOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
