const Review = require("../models/reviewModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.createReview = catchAsync(async (request, response) => {
  const review = await Review.create({
    ...request.body,
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
  const cleanedReviews = new APIFeatures(request.query, Review.find())
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
