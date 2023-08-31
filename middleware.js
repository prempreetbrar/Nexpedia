const morgan = require("morgan");

const express = require("express");
const path = require("path");

const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const bookingController = require("./controllers/bookingController");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const viewRouter = require("./routes/viewRoutes");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");

const AppError = require("./utils/appError");
const errorController = require("./controllers/errorController");

exports.security = (app) => {
  // heroku uses a proxy so we need to trust proxies
  app.enable("trust proxy");
  // simple and nonsimple requests
  app.use(cors());
  app.options("*", cors());

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", "data:", "blob:", "https:", "ws:"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", "https:", "data:"],
          scriptSrc: [
            "'self'",
            "https:",
            "http:",
            "blob:",
            "https://*.mapbox.com",
            "https://js.stripe.com",
            "https://m.stripe.network",
            "https://*.cloudflare.com",
          ],
          frameSrc: ["'self'", "https://js.stripe.com"],
          objectSrc: ["'none'"],
          styleSrc: ["'self'", "https:", "'unsafe-inline'"],
          workerSrc: [
            "'self'",
            "data:",
            "blob:",
            "https://*.tiles.mapbox.com",
            "https://api.mapbox.com",
            "https://events.mapbox.com",
            "https://m.stripe.network",
          ],
          childSrc: ["'self'", "blob:"],
          imgSrc: ["'self'", "data:", "blob:"],
          formAction: ["'self'"],
          connectSrc: [
            "'self'",
            "'unsafe-inline'",
            "data:",
            "blob:",
            "https://*.stripe.com",
            "https://*.mapbox.com",
            "https://*.cloudflare.com/",
            "https://bundle.js:*",
            "ws://127.0.0.1:*/",
          ],
          upgradeInsecureRequests: [],
        },
      },
    })
  );

  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: {
      status: 429,
      error: "Too many requests from this IP; please try again in an hour!",
    },
  });
  app.use("/api", limiter);

  // protect against noSQL injection, cross-site scripting, parameter pollution
  app.use(mongoSanitize());
  app.use(xss());
  app.use(
    hpp({
      whitelist: [
        "duration",
        "ratingsQuantity",
        "ratingsAverage",
        "maxGroupSize",
        "difficulty",
        "price",
      ],
    })
  );
};

exports.presentation = (app) => {
  app.use(express.static(path.join(__dirname, "public")));
  app.set("view engine", "pug");
  app.set("views", path.join(__dirname, "views"));
};

exports.environment = (app) => {
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // force usage of https
  if (process.env.NODE_ENV === "production") {
    app.use((request, response, next) => {
      if (request.get("x-forwarded-proto") !== "https") {
        response.redirect(`https://${request.header("host")}${request.url}`);
      } else {
        next();
      }
    });
  }
};

exports.body = (app) => {
  // special exception: don't use JSON for stripe webhook receiving
  app.post(
    "/transaction-complete",
    express.raw({ type: "application/json" }),
    bookingController.transactionComplete
  );

  app.use(express.json({ limit: "50kb" }));
  app.use(cookieParser());
  app.use(compression());
};

exports.routes = (app) => {
  app.use("/", viewRouter);
  app.use("/api/v1/tours", tourRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/reviews", reviewRouter);
  app.use("/api/v1/bookings", bookingRouter);
};

exports.errors = (app) => {
  app.all("*", (request, response, next) => {
    next(
      new AppError(`Cannot find ${request.originalUrl} on the server!`),
      404
    );
  });
  app.use(errorController);
};
