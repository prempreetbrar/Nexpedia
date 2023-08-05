const fs = require("fs");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (request, response, next, value) => {
  console.log(`Tour id is: ${value}`);

  if (Number(request.params.id) > tours.length) {
    return response.status(404).json({
      status: "failed",
      message: "ID does not exist",
    });
  }
  next();
};

exports.checkBody = (request, response, next) => {
  if (!("name" in request.body && "price" in request.body)) {
    return response.status(404).json({
      status: "fail",
      message: 'Tour must contain "name" AND "price"',
    });
  }
  next();
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

exports.createTour = (request, response) => {
  const newID = tours[tours.length - 1].id + 1;
  const newTour = { id: newID, ...request.body };
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      response.status(201);
      response.json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
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
