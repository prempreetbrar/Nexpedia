const util = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

function signToken(userId) {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
}

exports.protect = catchAsync(async (request, response, next) => {
  // 1) check if the JWT token exists
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    token = request.headers.authorization.split(" ")[1];
  }

  if (!token)
    throw new AppError(
      "You are not logged in. Please log in to get access.",
      401
    );

  // 2) is valid
  const decodedPayload = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3) check if user has been deleted in the meantime
  const user = await User.findById(decodedPayload.id);
  if (!user)
    throw new AppError(
      "The user belonging to this token no longer exists",
      401
    );

  // 4) user changed password after token was issued
  if (user.hasPasswordChanged(decodedPayload.iat)) {
    throw new AppError("User recently changed password! Please log in again.");
  }

  // 5) Grant access to protected route
  request.user = user;
  next();
});

exports.signUpUser = catchAsync(async (request, response) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  response.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.loginUser = catchAsync(async (request, response) => {
  const { email, password } = request.body;

  // check if email and password exist in body, check if user exists in db,
  // check if password is correct, then send token to client
  if (!email || !password) {
    throw new AppError("Please provide both an email and password!", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.isPasswordCorrect(password, user.password)))
    throw new AppError("Incorrect email or password", 401);

  const token = signToken(user._id);
  response.status(200).json({
    status: "success",
    token,
  });
});
