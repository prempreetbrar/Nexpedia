const factory = require("./controllerFactory");

const Tour = require("../models/tourModel");
const errorHandling = require("../utils/errorHandling");
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

exports.getOverview = errorHandling.catchAsync(async (request, response) => {
  const tours = await Tour.find();

  factory.view("./tours/overview", {
    title: "All Tours",
    tours,
  })(request, response);
});

exports.getMyTours = errorHandling.catchAsync(async (request, response) => {
  // 1) find all bookings
  const myBookings = await Booking.find({ user: request.user.id }).select(
    "tour"
  );

  // 2) get tours connected to bookings
  const tours = myBookings.map((booking) => booking.tour);
  if (tours.length === 0) {
    throw new errorHandling.AppError("You have not booked any tours.", 404);
  }

  factory.view("./tours/overview", {
    title: "My Bookings",
    tours,
  })(request, response);
});

exports.getTour = errorHandling.catchAsync(async (request, response) => {
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour)
    throw new errorHandling.AppError("There is no tour with that name.", 404);

  factory.view("./tours/tour", { title: `${tour.name} Tour`, tour })(
    request,
    response
  );
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
