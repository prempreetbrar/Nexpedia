const util = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");

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

function createSendToken(user, statusCode, response) {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
  };
  response.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  response.status(statusCode).json({
    status: "success",
    token: signToken(user.id),
    data: {
      user,
    },
  });
}

exports.protect = catchAsync(async (request, response, next) => {
  // 1) check if the JWT token exists
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    token = request.headers.authorization.split(" ")[1];
  } else if (request.cookies.jwt) {
    token = request.cookies.jwt;
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
  response.locals.user = user;
  next();
});

exports.isLoggedIn = async (request, response, next) => {
  if (request.cookies.jwt) {
    // 1) token exists
    try {
      token = request.cookies.jwt;

      // 2) is valid
      const decodedPayload = await util.promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      // 3) check if user has been deleted in the meantime
      const user = await User.findById(decodedPayload.id);
      if (!user) return next();

      // 4) user changed password after token was issued
      if (user.hasPasswordChanged(decodedPayload.iat)) {
        return next();
      }

      // User is indeed logged in.
      response.locals.user = user;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

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

  await new Email(
    newUser,
    `${request.protocol}://${request.get("host")}/me`
  ).sendWelcome();
  createSendToken(newUser, 201, response);
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

  createSendToken(user, 200, response);
});

exports.logoutUser = catchAsync(async (request, response) => {
  response.cookie("jwt", "LoggedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  response.status(200).json({ status: "success" });
});

exports.forgotPassword = catchAsync(async (request, response, next) => {
  // get user using email, generate reset token, send email containing token
  const user = await User.findOne({ email: request.body.email });
  if (!user)
    throw new AppError("There is no user with that email address.", 404);

  const resetToken = user.createPasswordResetToken();
  const resetURL = `${request.protocol}://${request.get(
    "host"
  )}/resetPassword/${request.body.email}/${resetToken}`;

  // password - select: false. Therefore, our user object does not have a password.
  // However, password - required: true. So, when we go to save, we would get an error.
  // That is why we do not want to validate before save; it is to account for the fact
  // that we cannot select the password and thus cannot meet the required constraint.
  await user.save({ validateBeforeSave: false });

  try {
    await new Email(user, resetURL).sendPasswordReset();

    response.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // see comment above
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
  user.password = request.body.newPassword;
  user.passwordConfirm = request.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) log user in
  createSendToken(user, 200, response);
});

exports.changePassword = catchAsync(async (request, response, next) => {
  // 1) we want user to still write password (so that somebody
  // can't just find an open computer and change the password)
  // 2) Check if given password is correct
  const userWithPassword = await User.findById(request.user.id).select(
    "+password"
  );

  if (
    !(await userWithPassword.isPasswordCorrect(
      request.body.currentPassword,
      userWithPassword.password
    ))
  )
    throw new AppError("The existing password provided was incorrect.", 401);

  // 3) Update password
  userWithPassword.password = request.body.newPassword;
  userWithPassword.passwordConfirm = request.body.confirmPassword;
  await userWithPassword.save();

  // 4) Send new JWT token with updated password
  createSendToken(userWithPassword, 200, response);
});
