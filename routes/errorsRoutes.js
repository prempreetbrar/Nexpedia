module.exports = (request, response, next) => {
  response.status(404).json({
    status: "fail",
    message: `Cannot find ${request.originalUrl} on the server!`,
  });
};
