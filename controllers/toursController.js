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

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.query.fields = "name,price,ratingsAverage,summary,difficulty";

  next();
};

exports.getAllTours = async (request, response) => {
  try {
    // special
    const excludedQuery = { ...request.query };
    const excludedParams = ["page", "sort", "limit", "fields"];
    excludedParams.forEach((param) => delete excludedQuery[param]);

    // advanced filtering
    let filteredQuery = JSON.stringify(excludedQuery);
    filteredQuery = filteredQuery.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    filteredQuery = Tour.find(JSON.parse(filteredQuery));

    // sorting
    const sortString = request.query.sort
      ? request.query.sort.replaceAll(",", " ")
      : "-createdAt _id";
    const fAndSQuery = filteredQuery.sort(sortString);

    // projection
    const projectionString = request.query.fields
      ? request.query.fields.replaceAll(",", " ")
      : "-__v";
    const fAndSAndPQuery = fAndSQuery.select(projectionString);

    // pagination
    const pageNumber = Number(request.query.page) || 1;
    const resultsPerPage = Number(request.query.limit) || 100;
    const numPages = Math.ceil(
      (await fAndSAndPQuery.countDocuments()) / resultsPerPage
    );
    if (pageNumber > numPages) throw new Error("This page does not exist.");

    const paginatedQuery = fAndSAndPQuery
      .skip((pageNumber - 1) * resultsPerPage) // skip the results on all previous pages
      .limit(resultsPerPage); // show the limit on the current page

    // execute the query
    const tours = await Tour.find(paginatedQuery);

    response.status(200).json({
      status: "success",
      page: pageNumber,
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
