const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.signUpUser = catchAsync(async (request, response) => {
  const newUser = await User.create(request.body);
  response.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});
