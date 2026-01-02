const { listingSchema, reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn=(req, res, next)=>{

  console.log(req.user);
    if(!req.isAuthenticated())
  {
    req.flash("error", "you must be logged in");
   return  res.redirect("/login");
  }
  next();
} 

//MW= joi , server site validation apply, made a function an dapply in the api call
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(4040, error.details[0].message);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
     let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(4040,errMsg);
  } else {
    next();
  }
};

 module.exports.isOwner=async (req, res, next )=>{
   let {id}=req.params;
   let listing =await Listing.findById(id); 
    if(!listing.owner.equals(res.locals.currUser._id)){
      req.flash("error", "you are not the owner, you dont have permisiion to edit bro"); 
     return  res.redirect(`/listings/${id}`);
    }
    next();
    
 };
  module.exports.isAuthor=async (req, res, next )=>{
   let {id,reviewId}=req.params;
   let review =await Review.findById(reviewId); 
    if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error", " you are not the author,you dont have permisiion to create review,"); 
     return  res.redirect(`/listings/${id}`);
    }
    next();
    
 };