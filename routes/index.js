var express = require('express');
var router = express.Router();
var userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');

// Passport configuration
passport.use(new localStrategy(userModel.authenticate()));

// Serialize and deserialize user for sessions
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{nav:true});
});

router.get('/register', function(req, res, next) {
  res.render('register',{nav:true});
});

// Register post route with error handling 
router.post('/register', function(req, res, next) {
  let { username, email, name, number } = req.body;
  let userdata = new userModel({ username, email, name, number });

  userModel.register(userdata, req.body.password, function(err, user) {
    if (err) {
      console.log(err); // Log the error for debugging
      return res.redirect('/register'); // Redirect back to register page on error
    }

    passport.authenticate("local")(req, res, function() {
      res.redirect("/profile");
    });
  });
});
//register post route without
// router.post('/register', function(req, res, next) {
  // var user = new userModel({
  //   name: req.body.name ,
  //   username: req.body.username ,
  //   email: req.body.email ,
  //   number: req.body.number ,  
  // });
//   userModel.register(user,req.body.password).then(function(){
//     passport.authenticate("local")(req,res,function(){
//       res.redirect('/profile');
//     });
//   });
// });

// Profile route
router.get('/profile', isloggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('profile',{user, nav:false});
});

// Login post route
router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/"
}));

// upload and change profile route
router.post('/fileupload', isloggedIn, upload.single('Image') , async function(req,res,next){
  const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();
  // res.send('uploaded');
  res.redirect('/profile');
});

// createpost route
router.get('/post', isloggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('addpost',{user, nav:false});
});

// Logout route
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Middleware function
function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
