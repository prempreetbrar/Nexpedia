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
      message: "PLACEHOLDER: Invalid data sent!",
    });
  }
};

exports.getAllTours = (request, response) => {
  response.status(200);
  response.json({
    status: "success",
    requestedAt: request.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (request, response) => {
  const { id } = request.params;
  const tour = tours.find((tour) => tour.id === Number(id));

  if (tour) {
    response.status(200);
    response.json({
      status: "success",
      data: {
        tour,
      },
    });
  } else {
    response.status(404);
    response.json({
      status: "fail",
      message: "Invalid ID",
    });
  }
};

exports.updateTour = (request, response) => {
  const { id } = request.params;
  const tour = tours.find((tour) => tour.id === Number(id));
  const updatedTour = { ...tour, ...request.body };
  tours[Number(id)] = updatedTour;

  if (tour) {
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        response.status(200).json({
          status: "success",
          data: {
            tour: updatedTour,
          },
        });
      }
    );
  } else {
    response.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
};

exports.deleteTour = (request, response) => {
  response.status(204).json({
    status: "success",
    data: null,
  });
};
