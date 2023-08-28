const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("../models/tourModel");
const factory = require("./controllerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getCheckout = catchAsync(async (request, response, next) => {
  // 1) get the currently booked tour
  const tour = await Tour.findById(request.params.tourId);

  // 2) create the checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    success_url: `${request.protocol}://${request.get("host")}/`,
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
    data: {
      session,
    },
  });
});
