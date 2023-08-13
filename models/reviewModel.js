const mongoose = require("mongoose");
const Tour = require("./tourModel");

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

reviewSchema.static(
  "calcAverageRatings",
  async function calcAverageRatings(tourId) {
    const stats = await this.aggregate([
      {
        $match: {
          tour: tourId,
        },
      },
      {
        $group: {
          _id: "$tour",
          numRatings: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (stats.length > 0) {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0]?.numRatings,
        ratingsAverage: stats[0].avgRating,
      });
    } else {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5,
      });
    }
  }
);

reviewSchema.pre("save", function (next) {
  /*
  Reason for difference compared to below: https://mongoosejs.com/docs/populate.html#populate_an_existing_mongoose_document
  */
  this.populate("user");
  next();
});

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, async function (review) {
  if (review) await review.constructor.calcAverageRatings(review.tour);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

module.exports = mongoose.model("Review", reviewSchema);
