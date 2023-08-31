const sharp = require("sharp");
const User = require("../models/userModel");
const factory = require("./controllerFactory");
const errorHandling = require("../utils/errorHandling");
const upload = require("../utils/multer");

exports.uploadMyPhoto = upload.single("photo");
exports.resizeMyPhoto = errorHandling.catchAsync(
  async (request, response, next) => {
    if (!request.file) {
      return next();
    }

    const fileName = `user-${request.user.id}.jpeg`;
    request.file.filename = fileName;

    await sharp(request.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${request.file.filename}`);

    next();
  }
);

exports.setUserId = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};

exports.updateMe = errorHandling.catchAsync(async (request, response) => {
  if (
    "currentPassword" in request.body ||
    "password" in request.body ||
    "passwordConfirm" in request.body
  )
    throw new errorHandling.AppError(
      "This route is NOT for password changes. Please use /changePassword."
    );

  const filters = new Set(["name", "photo", "email"]);
  const filteredBody = {};
  for (const key in request.body) {
    if (filters.has(key)) {
      filteredBody[key] = request.body[key];
    }
  }
  if (filters.has("photo") && request.file) {
    filteredBody["photo"] = request.file.filename;
  }

  const user = await User.findByIdAndUpdate(request.user.id, filteredBody, {
    new: true,
    runValidators: true,
  }).select(Array.from(filters).join(" "));

  response.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteMe = errorHandling.catchAsync(async (request, response) => {
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
