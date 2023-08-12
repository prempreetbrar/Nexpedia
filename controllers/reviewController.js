const Review = require("../models/reviewModel");
const factory = require("./controllerFactory");

const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.createReview = catchAsync(async (request, response) => {
  // if we are in a nested route and the tour was unspecified, then use that tourId
  request.body.tour = request.body.tour || request.params.tourId;

  const review = await Review.create({
    ...request.body,
    tour: request.body.tour,
    user: request.user.id,
  });

  response.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.getAllReviews = catchAsync(async (request, response) => {
  let filter = {};
  if (request.params.tourId) filter = { tour: request.params.tourId };

  const cleanedReviews = new APIFeatures(request.query, Review.find(filter))
    .filter()
    .sort()
    .project()
    .paginate();

  const reviews = await cleanedReviews.dbQuery;

  response.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
