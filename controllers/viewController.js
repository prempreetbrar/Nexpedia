const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (request, response) => {
  const tours = await Tour.find();

  response.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getAccount = (request, response) => {
  response.status(200).render("account", {
    title: "Your account",
  });
};

exports.getLogin = (request, response) => {
  response.status(200).render("login", {
    title: "Login",
  });
};

exports.getResetPassword = (request, response) => {
  response.locals.token = request.params.resetToken;
  response.status(200).render("resetPassword", {
    title: "Reset your password",
  });
};

exports.getTour = catchAsync(async (request, response) => {
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) throw new AppError("There is no tour with that name.", 404);

  response.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});
