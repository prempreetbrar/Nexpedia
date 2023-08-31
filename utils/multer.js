const multer = require("multer");
const errorHandling = require("./errorHandling");

const multerStorage = multer.memoryStorage();
const multerFilter = (request, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(
      new errorHandling.AppError(
        "Not an image! Please upload only images.",
        400
      ),
      false
    );
  }
};

module.exports = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
