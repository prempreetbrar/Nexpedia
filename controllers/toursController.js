const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

exports.createTour = async (request, response) => {
  try {
    const createdTour = await Tour.create(request.body);
    response.status(201).json({
      status: "success",
      data: {
        tour: createdTour,
      },
    });
  } catch (error) {
    response.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

exports.getAllTours = async (request, response) => {
  try {
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
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getTour = async (request, response) => {
  try {
    const tour = await Tour.findById(request.params.id);
    response.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
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
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};

exports.deleteTour = async (request, response) => {
  try {
    await Tour.findByIdAndDelete(request.params.id);
    response.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    response.status(404).json({
      status: "fail",
      message: error,
    });
  }
};
