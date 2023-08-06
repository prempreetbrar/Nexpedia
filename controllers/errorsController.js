module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (!error.isOperational) sendErrorNonOperational(error, response);
  switch (process.env.NODE_ENV) {
    case "development":
      sendErrorDev(error, response);
    default:
      sendErrorProd(error, response);
  }
};

function sendErrorDev(error, response) {
  response.status(error.statusCode).json({
    error: error,
    status: error.status,
    message: error.message,
    stack: error.stack,
  });
}

function sendErrorProd(error, response) {
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
}

function sendErrorNonOperational(error, response) {
  console.error("Error: ", error);

  response.status(500).json({
    status: "error",
    message: "Something went very wrong! Please contact support.",
  });
}
