module.exports = (request, response, next) => {
  const error = new Error(`Cannot find ${request.originalUrl} on the server!`);
  error.status = "fail";
  error.statusCode = 404;

  next(error);
};
