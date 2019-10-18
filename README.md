# YelpBBQ 

> A RESTful Node.js web application project that allows users to share their BBQ experience by uploading photos and comments.

## Live Demo

To see the app in action, go to [https://calm-depths-02705.herokuapp.com/](https://calm-depths-02705.herokuapp.com/)

- Username:  guest

- Password: guest

## Features
* Authentication:
  * User login with username and password
  * Admin sign-up with admin code
* Authorization:
  * One cannot manage posts and view user profile without being authenticated
  * One cannot edit or delete posts and comments created by other users
  * Admin can manage all posts and comments
* Manage campground posts with basic functionalities:
  * Create, edit and delete posts and comments
  * Upload campground photos
  * Display campground location on Google Maps
  * Search existing campgrounds
* Manage user account with basic functionalities:
Password reset via email confirmation~~ (disabled)
  * Profile page setup with sign-up
* Flash messages responding to users' interaction with the app
* Responsive web design
* 
### Custom Enhancements
* Update campground photos when editing campgrounds
* Update personal information on profile page
* Improve image load time on the landing page using Cloudinary
* Use Helmet to strengthen security

### Front-end

* [ejs](#)(http://ejs.co/)
* [Google Maps APIs](#)(https://developers.google.com/maps/)
* [Bootstrap](#)(https://getbootstrap.com/docs/3.3/)

### Back-end

* [express](#)(https://expressjs.com/)
* [mongoDB](#)(https://www.mongodb.com/)
* [mongoose](#)(http://mongoosejs.com/)
* [async](#)(http://caolan.github.io/async/)
* [crypto](#)(https://nodejs.org/api/crypto.html#crypto_crypto)
* [helmet](#)(https://helmetjs.github.io/)
* [passport](#)(http://www.passportjs.org/)
* [passport-local](#)(https://github.com/jaredhanson/passport-local#passport-local)
* [express-session](#)(https://github.com/expressjs/session#express-session)
* [method-override](#)(https://github.com/expressjs/method-override#method-override)
* [nodemailer](#)(https://nodemailer.com/about/)
* [moment](#)(https://momentjs.com/)
* [cloudinary](#)(https://cloudinary.com/)
* [geocoder](#)(https://github.com/wyattdanger/geocoder#geocoder)
* [connect-flash](#)(https://github.com/jaredhanson/connect-flash#connect-flash)

### Platforms

* [Cloudinary](#)(https://cloudinary.com/)
* [Heroku](#)(https://www.heroku.com/)
* [Cloud9](#)(https://aws.amazon.com/cloud9/?origin=c9io)

### What Next
* Immigrate to AWS and DynamoDB