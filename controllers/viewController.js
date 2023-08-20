const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (request, response) => {
  const tours = await Tour.find();

  response.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (request, response) => {
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  response
    .status(200)
    .set(
      "Content-Security-Policy",
      "connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com"
    )
    .render("tour", {
      title: `${tour.name} Tour`,
      tour,
    });
});
