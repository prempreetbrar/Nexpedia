const APIFeatures = require("../utils/apiFeatures");
const errorHandling = require("../utils/errorHandling");

exports.createOne = (Model) => {
  return errorHandling.catchAsync(async (request, response) => {
    const document = await Model.create(request.body);
    response.status(201).json({
      status: "success",
      data: {
        [Model.modelName.toLowerCase()]: document,
      },
    });
  });
};

exports.getAll = (Model) => {
  return errorHandling.catchAsync(async (request, response) => {
    const cleanedQuery = new APIFeatures(
      request.query,
      Model.find(request.body.filter || {})
    )
      .filter()
      .sort()
      .project()
      .paginate();
    const documents = await cleanedQuery.dbQuery;

    response.status(200).json({
      status: "success",
      page: cleanedQuery.pageNumber,
      results: documents.length,
      data: {
        [Model.modelName.toLowerCase() + "s"]: documents,
      },
    });
  });
};

exports.getOne = (Model, populateOptions) => {
  return errorHandling.catchAsync(async (request, response) => {
    let query = Model.findById(request.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;
    if (!document)
      throw new errorHandling.AppError(
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
  return errorHandling.catchAsync(async (request, response) => {
    const document = await Model.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!document)
      throw new errorHandling.AppError(
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
  return errorHandling.catchAsync(async (request, response) => {
    const document = await Model.findByIdAndDelete(request.params.id);
    if (!document)
      throw new errorHandling.AppError(
        `No ${Model.modelName} found with ID ${request.params.id}`,
        404
      );

    response.status(204).json({
      status: "success",
      data: null,
    });
  });
};

exports.view = (templateName, variables) => {
  return (request, response) => {
    response.status(200).render(templateName, {
      ...variables,
      resetToken: request.params.resetToken || "",
      email: request.params.email || "",
    });
  };
};
