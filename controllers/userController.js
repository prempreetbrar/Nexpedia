const multer = require("multer");
const User = require("../models/userModel");
const factory = require("./controllerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const multerStorage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, "public/img/users");
  },
  filename: (request, file, callback) => {
    const fileExtension = file.mimetype.split("/").pop();
    const fileName = `user-${request.user.id}.${fileExtension}`;
    callback(null, fileName);
  },
});

const multerFilter = (request, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(
      new AppError("Not an image! Please upload only images.", 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadMyPhoto = upload.single("photo");

exports.setUserId = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};

exports.updateMe = catchAsync(async (request, response) => {
  if (
    "currentPassword" in request.body ||
    "password" in request.body ||
    "passwordConfirm" in request.body
  )
    throw new AppError(
      "This route is NOT for password changes. Please use /changePassword."
    );

  const filters = new Set(["name", "email"]);
  const filteredBody = {};
  for (const key in request.body) {
    if (filters.has(key)) {
      filteredBody[key] = request.body[key];
    }
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
