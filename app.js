const express = require("express");
const morgan = require("morgan");

const errorController = require("./controllers/errorsController");

const tourRouter = require("./routes/toursRoutes");
const userRouter = require("./routes/usersRoutes");
const errorRouter = require("./routes/errorsRoutes");

const app = express();
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("*", (request, response, next) => {
  next(new AppError(`Cannot find ${request.originalUrl} on the server!`), 404);
});
app.use(errorController);

module.exports = app;
