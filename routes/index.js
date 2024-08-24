var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');

// Passport configuration
passport.use(new localStrategy(userModel.authenticate()));

// Serialize and deserialize user for sessions
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

/* login route */
router.get('/', function(req, res, next) {
  // console.log(req.flash());
  res.render('index',{nav:true,error:req.flash('error')});
});

// Login post route
router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/",
  failureFlash: true,
}));

/* Register route */
router.get('/register', function(req, res, next) {
  res.render('register',{nav:true,error:req.flash('error')});
});

// Register post route with error handling 
router.post('/register', function(req, res, next) {
  let { username, email, name, number } = req.body;
  let userdata = new userModel({ username, email, name, number });

  userModel.register(userdata, req.body.password, function(err, user) {
    if (err) {
      console.log(err); // Log the error for debugging
      req.flash('error', err.message); // Set the error message in flash
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
  const user = await userModel
                      .findOne({username: req.session.passport.user})
                      .populate('post');
  res.render('profile',{user, nav:false});
});

// upload and change profilePic route
router.post('/fileupload', isloggedIn, upload.single('Image') , async function(req,res,next){
  const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();
  // res.send('uploaded');
  res.redirect('/profile');
});

// Show a userpost route
router.get('/userpost', isloggedIn, async function(req, res, next) {
  const user = await userModel
                      .findOne({username: req.session.passport.user})
                      .populate('post');
  res.render('userpost',{user, nav:false});
});


// createpost route
router.get('/post', isloggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('addpost',{user, nav:false});
});

// post route create post
router.post('/createpost', isloggedIn, upload.single('postimage') , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    title: req.body.title,
    description:req.body.description, 
    user: user._id,
    postImage: req.file.filename 
  });
  user.post.push(post._id);
  await user.save();
  res.redirect('/profile');
});

//  feedspage/homePage route
router.get('/feed', isloggedIn, async function(req, res, next) {
  const user = await userModel
                      .findOne({username: req.session.passport.user})
                      .populate('post');
  const Post= await postModel.find().populate('user');
  console.log(Post);
  res.render('feed',{user,Post, nav:false});
});

//
router.get('/feed/detail/:id', isloggedIn, async function(req, res, next) {
  const user = await userModel
                      .findOne({username: req.session.passport.user})
                      .populate('post');
  const post= await postModel.findById(req.params.id).populate('user');
  // console.log(Post);
  res.render('feeddetail',{user,post, nav:false});
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
