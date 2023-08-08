const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const AppError = require("./utils/appError");
const errorController = require("./controllers/errorsController");

const tourRouter = require("./routes/toursRoutes");
const userRouter = require("./routes/usersRoutes");

const app = express();

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: {
    status: 429,
    error: "Too many requests from this IP; please try again in an hour!",
  },
});

app.use(helmet());
app.use("/api", limiter);
app.use(express.json({ limit: "50kb" }));
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.all("*", (request, response, next) => {
  next(new AppError(`Cannot find ${request.originalUrl} on the server!`), 404);
});
app.use(errorController);

module.exports = app;
