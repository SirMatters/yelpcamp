var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');

//index rout
router.get("/", function(req, res){
  Campground.find({}, function(err, allCampgrounds){
    if(err){
      console.log(err);
    } else {
        res.render("campgrounds/index", {campgrounds: allCampgrounds});
    }
  });
});


//show new campground form
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new"); 
});

//SHOWs info about one campgorund
router.get("/:id", function(req, res){
  //find the campground with id
  //populate the comment text
  Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
    if(err || !foundCampground) {
      req.flash('error', 'Campground not found');
      res.redirect('back');
    } else {
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});

///add new campground logic
router.post("/", function(req, res){
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  Campground.create(req.body.campground, function(err, newOne){
    if(err){
      console.log("Sth went wrong: ");
      console.log(err);
    } else {
      // redirect app to campgrounds page
      newOne.author = author;
      newOne.save();
      res.redirect("/campgrounds");
    }
  });
});

//EDIT campground route
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
      res.render('campgrounds/edit', {campground: foundCampground});
    });
});

//UPDATE campground route
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
  //find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
    res.redirect('/campgrounds/' + updatedCampground._id);
  });
});

//DESTROY rout campground
router.delete('/:id', function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect('/campgrounds');
      console.log(err);
    }
    res.redirect('/campgrounds');
  });
});

module.exports = router;