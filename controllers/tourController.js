const Tour = require("../models/tourModel");
const factory = require("./controllerFactory");

const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createTour = factory.createOne(Tour);

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

exports.getAllTours = catchAsync(async (request, response) => {
  const cleanedTours = new APIFeatures(request.query, Tour.find())
    .filter()
    .sort()
    .project()
    .paginate();
  const tours = await cleanedTours.dbQuery;

  response.status(200).json({
    status: "success",
    page: cleanedTours.pageNumber,
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

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
