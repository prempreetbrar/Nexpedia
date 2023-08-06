const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.createTour = catchAsync(async (request, response) => {
  const createdTour = await Tour.create(request.body);
  response.status(201).json({
    status: "success",
    data: {
      tour: createdTour,
    },
  });
});

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

exports.getTour = catchAsync(async (request, response) => {
  const tour = await Tour.findById(request.params.id);
  response.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (request, response) => {
  const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });
  response.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (request, response) => {
  await Tour.findByIdAndDelete(request.params.id);
  response.status(204).json({
    status: "success",
    data: null,
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
