const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const DUPLICATE = 11000;

module.exports = (error, request, response, next) => {
  let detailedError = { ...error };
  detailedError.message = error.message;
  detailedError.stack = error.stack;
  detailedError.isOperational = error.isOperational;
  detailedError.statusCode = error.statusCode || 500;
  detailedError.status = error.status || "error";

  if (error instanceof mongoose.Error.CastError)
    detailedError = handleDBCastError(detailedError);
  else if (error.code === DUPLICATE)
    detailedError = handleDBDuplicateError(detailedError);
  else if (error instanceof mongoose.Error.ValidationError)
    detailedError = handleDBValidationError(detailedError);
  else if (error instanceof jwt.TokenExpiredError) {
    detailedError = handleJSONTokenExpiredError();
  } else if (error instanceof jwt.JsonWebTokenError) {
    detailedError = handleJSONWebTokenError();
  }

  if (process.env.NODE_ENV === "production") {
    sendErrorProd(detailedError, response);
  } else sendErrorDev(detailedError, response);
};

function handleDBCastError(error) {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}

function handleDBDuplicateError(error) {
  const message = `DUPLICATE FIELD. ${Object.keys(error.keyValue)[0]}: ${
    Object.values(error.keyValue)[0]
  }. Please use another ${Object.keys(error.keyValue)[0]}.`;
  return new AppError(message, 404);
}

function handleDBValidationError(error) {
  const messages = ["Validation Error(s):"];
  const errors = error.errors;

  for (const error in errors) {
    const keyName = error;
    const keyValue = errors[error].value;
    const errorMessage = errors[error].message;

    const responseOutput = `${keyName}: ${keyValue} - ${errorMessage}     `;
    messages.push(responseOutput);
  }

  const message = messages.join(" ");
  return new AppError(message, 400);
}

function handleJSONWebTokenError() {
  return new AppError("Invalid token. Please log in again!", 401);
}

function handleJSONTokenExpiredError() {
  return new AppError("Your token has expired. Please log in again!", 401);
}

function sendErrorDev(error, response) {
  return response.status(error.statusCode).json({
    error: error,
    status: error.status,
    message: error.message,
    stack: error.stack,
  });
}

function sendErrorProd(error, response) {
  if (!error.isOperational) {
    sendErrorNonOperational(error, response);
  } else {
    return response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }
}

function sendErrorNonOperational(error, response) {
  console.error("Error: ", error);

  return response.status(500).json({
    status: "error",
    message: "Something went very wrong! Please contact support.",
  });
}