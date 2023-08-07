const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.signUpUser = catchAsync(async (request, response) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
  });

  response.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});
