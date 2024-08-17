var express = require('express');
var router = express.Router();
var userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/register', function(req, res, next) {
  res.render('register');
});

//register post route
router.post('/register', function(req, res, next) {
  var user = new userModel.create({
    name: req.body.name ,
    username: req.body.username ,
    email: req.body.email ,
    number: req.body.number ,  
  });
  userModel.register(user, req.body.password).then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    });
  });
});

//login post route
router.post('/login', isloggedIn , passport.authenticate     ("local", {
    successRedirect:"/profile",
    failureRedirect:"/"
 }), function(req, res, next) {

});

//logout route
router.get('/logout',function(req,res,next){
  req.logout(function(err){
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

//middleware function
function isloggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}


module.exports = router;
