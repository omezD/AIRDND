//this is my new first major project of the 2025
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const sessionOptions = {
  secret: "mysupersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //in miliseconds(1 week ex)
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, //to prevent cross scripting attack
  },
};

const port = 3000;
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.use(session(sessionOptions));
app.use(flash());

//use of passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//for creating and passing flash MW
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  next();
});
app.get("/", (req, res) => {
  console.log("started my web-app");
  res.render("landing.ejs");
});

//all the routes
//for the whole listings routes, just write the one line
app.use("/listings", listingRouter);
//for the whole review routes, just write the one line
app.use("/listings/:id/review", reviewRouter);
app.use("/", userRouter);

//MW= joi , server site validation apply, made a function an dapply in the api call

app.all(/.*/, (req, res, next) => {
  //for all
  next(new ExpressError(404, "page not found bro"));
});

//eror handling MW
app.use((err, req, res, next) => {
  let {
    statusCode = 500,
    message = "something wait ewrong bro, default eerror message",
  } = err;
  res.render("error.ejs", { err });
  // res.status(statusCode).send(message);//customised response
  // res.send("something went wrong");//standard rsponse
});
app.listen(port, () => {
  console.log(`listening to port no: ${port}`);
});
