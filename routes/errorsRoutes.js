const AppError = require("../utils/appError");

module.exports = (request, response, next) => {
  next(new AppError(`Cannot find ${request.originalUrl} on the server!`), 404);
};
