const express        = require("express"),
      app            = express(),
      bodyParser     = require("body-parser"),
      mongoose       = require("mongoose"),
      helmet         = require("helmet"),
      flash          = require("connect-flash"),
      session        = require("express-session"),
      moment         = require("moment"),
      passport       = require("passport"),
      LocalStrategy  = require("passport-local"),
      methodOverride = require("method-override"),
      User           = require("./models/user");

// requiring routes     
const indexRoute      = require("./routes/index"),
      bbqplaceRoute   = require("./routes/bbqplaces"),
      commentRoute    = require("./routes/comments"),
      userRoute       = require("./routes/user"),
      passwordRoute   = require("./routes/password");

require('dotenv').config();

// connect to the DB
//let url = process.env.DATABASEURL; // fallback in case global var not working
//let url = "mongodb+srv://guest314:guest314@yelpbbq-yvlf1.mongodb.net/test?retryWrites=true&w=majority"
//let localurl = "mongodb://localhost/yelpbbq"



mongoose.connect("mongodb+srv://guest314:guest314@yelpbbq-yvlf1.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useCreateIndex: true
}).then(() => {
  console.log("Connected to DB");
}).catch(err => console.log(`Database connection error: ${err.message}`));


app.set("view engine", "ejs");
app.use(helmet());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = moment; // create local variable available for the application

//passport configuration
//process.env.SESSIONSECRET
app.use(session({
  secret: process.env.SESSIONSECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// pass currentUser to all routes
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // req.user is an authenticated user
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// use routes
app.use("/", indexRoute);
app.use("/bbqplaces", bbqplaceRoute);
app.use("/bbqplaces/:id/comments", commentRoute);
app.use("/users", userRoute);
app.use("/", passwordRoute);


app.listen(process.env.PORT, process.env.IP, () => console.log("The YelpBBQ Server Has Started!"));
//Local debug
//app.listen(3000, () => console.log("The YelpBBQ Server Has Started!"));
