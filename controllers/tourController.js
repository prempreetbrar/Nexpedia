const sharp = require("sharp");
const Tour = require("../models/tourModel");
const factory = require("./controllerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const upload = require("../utils/multer");

exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (request, response, next) => {
  if (!request.files || !request.files.imageCover || !request.files.images) {
    return next();
  }
  const { imageCover, images: remainingImages } = request.files;

  request.body.imageCover = `tour-${request.params.id}-cover.jpeg`;
  const imageCoverPromise = sharp(imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${request.body.imageCover}`);

  request.body.images = [];
  const remainingImagesPromise = remainingImages.map((image, index) => {
    const fileName = `tour-${request.params.id}-${index + 1}.jpeg`;
    request.body.images.push(fileName);

    return sharp(image.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 50 })
      .toFile(`public/img/tours/${fileName}`);
  });

  await Promise.all([imageCoverPromise, ...remainingImagesPromise]);
  next();
});

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

exports.getDistances = catchAsync(async (request, response) => {
  const { latitudeLongitude, unit } = request.params;
  const multiplier = unit === "mi" ? 0.000621371 : 0.001;
  const [latitude, longitude] = latitudeLongitude.split(",");
  if (!latitude || !longitude)
    throw new AppError(
      "You must specify latitude and longitude in the format lat,lng",
      400
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: {
            type: String,
            default: "Point",
            enum: ["Point"],
          },
          coordinates: [Number(longitude), Number(latitude)],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  response.status(200).json({
    status: "success",
    results: distances.length,
    data: {
      distances,
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
