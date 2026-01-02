const express = require("express");
const router = express.Router({ mergeParams: true });//to get the id from the parent route
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn,validateReview,isAuthor} = require("../middleware.js");


//for the review routes


// post review routes
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      console.log("Listing not found");
      return res.send("Listing not found");
    }

    const review = new Review({
      comment: req.body.review.comment,
      rating: Number(req.body.review.rating),
      author:req.user._id,
    });

    await review.save();
    console.log(" Review saved:", review._id);

    listing.reviews.push(review._id);
    await listing.save();
    req.flash("success", "new review created successfully");

    console.log(" Listing updated with review");

    res.redirect(`/listings/${id}`);
  })
);

//delete review routes
router.delete("/:reviewId",isLoggedIn, isAuthor,async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //match and pull the reviewId from the reviews of id listing
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "review deleted  successfully");
  res.redirect(`/listings/${id}`);
});

module.exports = router;
