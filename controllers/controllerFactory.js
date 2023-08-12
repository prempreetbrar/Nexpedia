const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.deleteOne = (Model) => {
  return catchAsync(async (request, response) => {
    const document = await Model.findByIdAndDelete(request.params.id);
    if (!document)
      throw new AppError(
        `No ${Model.modelName} found with ID ${request.params.id}`,
        404
      );

    response.status(204).json({
      status: "success",
      data: null,
    });
  });
};
