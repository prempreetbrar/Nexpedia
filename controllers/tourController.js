const Tour = require("../models/tourModel");
const factory = require("./controllerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

exports.getToursWithin = catchAsync(async (request, response) => {
  const { distance, latitudeLongitude, unit } = request.params;
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  const [latitude, longitude] = latitudeLongitude.split(",");
  if (!latitude || !longitude)
    throw new AppError(
      "You must specify latitude and longitude in the format lat,lng",
      400
    );

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radius],
      },
    },
  });

  response.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTourStatistics = catchAsync(async (request, response) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        totalRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);

  response.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (request, response) => {
  const year = Number(request.params.year);
  const stats = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
  ]);

  response.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.createTour = factory.createOne(Tour);
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
