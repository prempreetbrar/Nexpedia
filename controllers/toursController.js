const Tour = require("../models/tourModel");

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

exports.getAllTours = async (request, response) => {
  try {
    // exclusion
    let query = { ...request.query };
    const excludedParams = ["page", "sort", "limit", "fields"];
    excludedParams.forEach((param) => delete query[param]);

    // advanced filtering
    query = JSON.stringify(query);
    query = query.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    query = JSON.parse(query);

    // execute the query
    const tours = await Tour.find(query);

    response.status(200).json({
      status: "success",
      results: tours.length,
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
