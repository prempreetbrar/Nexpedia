const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Booking = require("../models/bookingModel");

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

exports.getMyTours = catchAsync(async (request, response) => {
  // 1) find all bookings
  const myBookings = await Booking.find({ user: request.user.id }).select(
    "tour"
  );

  // 2) get tours connected to bookings
  const tours = myBookings.map((booking) => booking.tour);
  if (tours.length === 0) {
    throw new AppError("You have not booked any tours.", 404);
  }
  response.status(200).render("overview", {
    title: "My Bookings",
    tours,
  });
});

exports.getLogin = (request, response) => {
  response.status(200).render("login", {
    title: "Login",
  });
};

exports.getResetPassword = (request, response) => {
  response.locals.resetToken = request.params.resetToken;
  response.locals.email = request.params.email;
  response.status(200).render("resetPassword", {
    title: "Reset your password",
  });
};

exports.getForgotPassword = (request, response) => {
  response.status(200).render("forgotPassword", {
    title: "Forgot your password?",
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
