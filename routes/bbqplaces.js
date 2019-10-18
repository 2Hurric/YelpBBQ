const express    = require("express"),
      router     = express.Router(),
      Campground = require("../models/campground"),
      middleware = require("../middleware"), // automatically looks for index.js
      NGeocoder   = require("node-geocoder"),
      multer     = require('multer'),
      cloudinary = require('cloudinary');

require('dotenv').config();

//options for Node-Geocode
var options = {
  provider: 'google',
  apiKey: process.env.GEOCODERAPI
};

var geocoder = NGeocoder(options);


// =========== Image Upload Configuration =============
//multer config
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = (req, file, cb) => {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter});

//cloudinary config
cloudinary.config({ 
  cloud_name: 'dtynctaes', 
  api_key: 915584243224162, 
  api_secret: "1MR4Vi6uC-cPhrmKwmFuWMrydMg"
});

// ============= ROUTES ==============
// Define escapeRegex function to avoid regex DDoS attack
const escapeRegex = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// INDEX -show all bbqplaces
router.get("/", (req, res) => {
  let noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Campground.find({name: regex}, function(err, allCampgrounds) {
      if (err) { console.log(err); }
      else {
        if (allCampgrounds.length < 1) {
          noMatch = "No BBQplaces found, please try again.";
        }
        res.render("bbqplaces/index", { campgrounds: allCampgrounds, page: "bbqplaces", noMatch: noMatch });  
      }
    });
  } else {
    // Get all camgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
      if (err) { console.log(err); }
      else {
        res.render("bbqplaces/index", { campgrounds: allCampgrounds, page: "bbqplaces", noMatch: noMatch });  
      }
    }); 
  }
});

// CREATE - add new bbqplace to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), (req, res) => {
  // cloudinary
  cloudinary.uploader.upload(req.file.path, (result) => {
     // get data from the form
    let { name, image, price, description, author } = { 
      name: req.body.name,
      image: {
        // add cloudinary public_id for the image to the campground object under image property
        id: result.public_id,
        // add cloudinary url for the image to the campground object under image property
        url: result.secure_url
      },
      price: req.body.price,
      description: req.body.description,
      // get data from the currenly login user
      author: {
        id: req.user._id,
        username: req.user.username
      }
    };
  
    // geocoder for Google Maps
    geocoder.geocode(req.body.location, (err, data) => {
      if (err) throw err;
      //console.log(data);
      let lat = data[0].latitude,
          lng = data[0].longitude,
          location = data[0].formattedAddress;
      let newCampground = { name, image, price, description, author, location, lat, lng };
    
      // create a new bbqplace and save to DB
      Campground.create(newCampground, (err, newlyCreated) => {
        if (err) { console.log(err); }
        else {
          // redirect back to campground page
          res.redirect("/bbqplaces");
        }
      });
    });
  });
});

// NEW
router.get("/new", middleware.isLoggedIn, (req, res) => res.render("bbqplaces/new"));

// SHOW - shows more info about one bbqplace
router.get("/:id", (req, res) => {
  //find the bbqplace with provided id in DB
  Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
    if (err || !foundCampground) {
      req.flash("error", "BBQplace not found");
      res.redirect("back");
    } else {
      //render show template with that campground
      res.render("bbqplaces/show", { campground: foundCampground });
    }
  });
});

// edit bbqplace route
// store original image id and url
let imageId, imageUrl;
router.get("/:id/edit", middleware.checkCampgroundOwenership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    imageId = foundCampground.image.id;
    imageUrl = foundCampground.image.url;
    if (err) { res.redirect("/bbqplaces") }
    else { res.render("bbqplaces/edit", { campground: foundCampground }); } 
  });
});

// update bbqplace route
router.put("/:id", middleware.checkCampgroundOwenership, upload.single('image'), (req, res) => {
  // if no new image to upload
  if (!req.file) {
    let { name, image, price, description, author } = { 
      name: req.body.campground.name,
      image: {
        // add cloudinary public_id for the image to the bbqplace object under image property
        id: imageId,
        // add cloudinary url for the image to the bbqplace object under image property
        url: imageUrl
      },
      price: req.body.campground.price,
      description: req.body.campground.description,
      // get data from the currenly login user
      author: {
        id: req.user._id,
        username: req.user.username
      }
    };
    geocoder.geocode(req.body.campground.location, (err, data) => {
      if (err) throw err;
      let lat = data[0].latitude,
          lng = data[0].longitude,
          location = data[0].formattedAddress;
      let newData = { name, image, price, description, author, location, lat, lng };
      
      //find and update the correct bbqplace
      Campground.findByIdAndUpdate(req.params.id, {$set: newData}, (err, updatedCampground) => {
        if (err) {
          req.flash("error", err.message);
          res.redirect("/bbqplaces");
        } else {
          //redirect somewhere(show page)
          req.flash("success","BBQplaces Updated!");
          res.redirect("/bbqplaces/" + req.params.id);
        }
      });
    });
  } else {
    // cloudinary
    cloudinary.uploader.upload(req.file.path, (result) => {
      let { name, image, price, description, author } = { 
        name: req.body.campground.name,
        image: {
          // add cloudinary public_id for the image to the bbqplace object under image property
          id: result.public_id,
          // add cloudinary url for the image to the bbqplace object under image property
          url: result.secure_url
        },
        price: req.body.campground.price,
        description: req.body.campground.description,
        // get data from the currenly login user
        author: {
          id: req.user._id,
          username: req.user.username
        }
      };
      
      // remove original/old bbqplace image on cloudinary
      cloudinary.uploader.destroy(imageId, (result) => { console.log(result) });
      
      geocoder.geocode(req.body.campground.location, (err, data) => {
        if (err) throw err;
        let lat = data[0].latitude,
            lng = data[0].longitude,
            location = data[0].formattedAddress;
        let newData = { name, image, price, description, author, location, lat, lng };
        
        //find and update the correct bbqplace
        Campground.findByIdAndUpdate(req.params.id, {$set: newData}, (err, updatedCampground) => {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/bbqplaces");
          } else {
            //redirect somewhere(show page)
            req.flash("success","BBQplace Updated!");
            res.redirect("/bbqplaces/" + req.params.id);
          }
        });
      });
    });
  }
});

// destroy bbqplace route
router.delete("/:id", middleware.checkCampgroundOwenership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, err => {
    if (err) { res.redirect("/bbqplaces"); }
    else {
      req.flash("success", "BBQplace removed!");
      res.redirect("/bbqplaces"); }
  });
});

module.exports = router;
