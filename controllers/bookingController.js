const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const factory = require("./controllerFactory");
const catchAsync = require("../utils/catchAsync");

exports.getCheckout = catchAsync(async (request, response, next) => {
  // 1) get the currently booked tour
  const tour = await Tour.findById(request.params.tourId);

  // 2) create the checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    success_url: `${request.protocol}://${request.get("host")}/?tour=${
      request.params.tourId
    }&user=${request.user.id}&price=${tour.price}`,
    cancel_url: `${request.protocol}://${request.get("host")}/tour/${
      tour.slug
    }`,
    customer_email: request.user.email,
    client_reference_id: request.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            // images
          },
        },
      },
    ],
  });

  // 3) send the checkout station to the client
  response.status(200).json({
    status: "success",
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (request, response, next) => {
  const { tour, user, price } = request.query;
  if (!tour || !user || !price) return next();
  await Booking.create({
    tour,
    user,
    price,
  });

  response.redirect(request.originalUrl.split("?")[0]);
});
