const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/userModel");
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
    success_url: `${request.protocol}://${request.get("host")}/me/bookings`,
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
            images: [
              `${request.protocol}://${request.get("host")}/img/tours/${
                tour.imageCover
              }`,
            ],
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

createBooking = catchAsync(async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
});

exports.transactionComplete = (request, response, next) => {
  const signature = request.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    response.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      createBooking(session);
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
