const factory = require("./controllerFactory");

const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Booking = require("../models/bookingModel");

exports.alertHandler = (request, response, next) => {
  const alertIsFor = request.query.alert;
  if (alertIsFor === "booking") {
    response.locals.alert = `Your booking was successful! Please check your email for a confirmation!
      If your booking doesn't show up here immediately, please come back later.
    `;
  }
  next();
};

exports.getOverview = catchAsync(async (request, response) => {
  const tours = await Tour.find();

  factory.view("overview", {
    title: "All Tours",
    tours,
  })(request, response);
});

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

  factory.view("overview", {
    title: "My Bookings",
    tours,
  })(request, response);
});

exports.getTour = catchAsync(async (request, response) => {
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) throw new AppError("There is no tour with that name.", 404);

  factory.view("tour", { title: `${tour.name} Tour`, tour })(request, response);
});

exports.getSignup = factory.view("./auth/signup", { title: "Sign up" });
exports.getLogin = factory.view("./auth/login", { title: "Login" });
exports.getAccount = factory.view("./auth/account", { title: "Your account" });
exports.getResetPassword = factory.view("./auth/resetPassword", {
  title: "Reset your password",
});
exports.getForgotPassword = factory.view("./auth/forgotPassword", {
  title: "Forgot your password?",
});
