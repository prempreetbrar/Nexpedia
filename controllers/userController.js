const User = require("../models/userModel");
const factory = require("./controllerFactory");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllUsers = catchAsync(async (request, response) => {
  const users = await User.find();

  response.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = (request, response) => {
  response.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

exports.createUser = factory.createOne(User);

exports.updateMe = catchAsync(async (request, response) => {
  if (
    "currentPassword" in request.body ||
    "password" in request.body ||
    "passwordConfirm" in request.body
  )
    throw new AppError(
      "This route is NOT for password changes. Please use /changePassword."
    );

  const filters = ["name", "email"];
  const filteredBody = {};
  for (const key in request.body) {
    if (key in filters) filteredBody[key] = request.body[key];
  }

  const user = await User.findByIdAndUpdate(request.user.id, filteredBody, {
    new: true,
    runValidators: true,
  }).select(filters.join(" "));

  response.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.deleteMe = catchAsync(async (request, response) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: "success",
    data: null,
  });
});
