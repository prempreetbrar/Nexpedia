const util = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");

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

exports.restrictTo = (...roles) => {
  return (request, response, next) => {
    if (!roles.includes(request.user.role))
      throw new AppError(
        "You do not have permission to perform this action.",
        403
      );

    next();
  };
};

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

exports.forgotPassword = catchAsync(async (request, response, next) => {
  // get user using email, generate reset token, send email containing token
  const user = await User.findOne({ email: request.body.email });
  if (!user)
    throw new AppError("There is no user with that email address.", 404);

  const resetToken = user.createPasswordResetToken();
  const resetURL = `${request.protocol}://${request.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \n
  If you didn't forget your password, please ignore this email.`;

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (only valid for 10 minutes).",
      message,
    });

    response.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
    throw new AppError(
      "There was an error sending the email. Try again later!",
      500
    );
  }
});

exports.resetPassword = catchAsync(async (request, response, next) => {
  // 1) get token
  const resetToken = request.params.token;
  const encryptedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 2) get user
  const user = await User.findOne({
    passwordResetToken: encryptedResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user)
    throw new Error(
      "The password reset token is either invalid, or has expired.",
      400
    );

  // 3) update user
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) log user in
  const token = signToken(user._id);
  response.status(200).json({
    status: "success",
    token,
  });
});
