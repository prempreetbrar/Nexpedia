const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createOne = (Model) => {
  return catchAsync(async (request, response) => {
    const document = await Model.create(request.body);
    response.status(201).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: document,
      },
    });
  });
};

exports.getOne = (Model, populateOptions) => {
  return catchAsync(async (request, response) => {
    let query = Model.findById(request.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;
    if (!document)
      throw new AppError(
        `No ${Model.modelName} found with ID ${request.params.id}`,
        404
      );

    response.status(200).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: document,
      },
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (request, response) => {
    const document = await Model.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!document)
      throw new AppError(
        `No ${Model.modelName} found with ID ${request.params.id}`,
        404
      );

    response.status(200).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: document,
      },
    });
  });
};

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