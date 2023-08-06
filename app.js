const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/toursRoutes");
const userRouter = require("./routes/usersRoutes");
const errorRouter = require("./routes/errorsRoutes");

const app = express();
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.all("*", errorRouter);

app.use((error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});

module.exports = app;
