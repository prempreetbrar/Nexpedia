const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const errorController = require("./controllers/errorController");

const viewRouter = require("./routes/viewRoutes");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: {
    status: 429,
    error: "Too many requests from this IP; please try again in an hour!",
  },
});

const scriptSrcUrls = [
  "https://unpkg.com/",
  "https://tile.openstreetmap.org",
  "https://*.cloudflare.com/",
  "https://cdnjs.cloudflare.com/ajax/libs/axios/",
  "https://*.stripe.com",
  "https:",
  "data:",
];
const styleSrcUrls = [
  "https://unpkg.com/",
  "https://tile.openstreetmap.org",
  "https://fonts.googleapis.com/",
  "https:",
];
const connectSrcUrls = [
  "https://unpkg.com",
  "https://tile.openstreetmap.org",
  "https://*.cloudflare.com/",
  "http://127.0.0.1:3000",
];
const fontSrcUrls = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "https:",
  "data:",
];
const frameSrcUrls = ["https://*.stripe.com"];

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "data:", "blob:"],
      baseUri: ["'self'"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", "blob:", "data:", "https:"],
      fontSrc: ["'self'", ...fontSrcUrls],
      childSrc: ["'self'", "blob:"],
      frameSrc: ["'self'", ...frameSrcUrls],
      upgradeInsecureRequests: [],
    },
  })
);
app.use("/api", limiter);
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());

// data sanitization against NoSQL query injection and XSS
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

app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.all("*", (request, response, next) => {
  next(new AppError(`Cannot find ${request.originalUrl} on the server!`), 404);
});
app.use(errorController);

module.exports = app;
