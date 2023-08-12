const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: [1, "You cannot give lower than one star."],
      max: [5, "You cannot give more than five stars."],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre("save", function (next) {
  /*
  Reason for difference compared to below: https://mongoosejs.com/docs/populate.html#populate_an_existing_mongoose_document
  */
  this.populate("user");
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

module.exports = mongoose.model("Review", reviewSchema);
