const User = require("../models/userModel");
const factory = require("./controllerFactory");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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

exports.deleteMe = catchAsync(async (request, response) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = factory.createOne(User);
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
