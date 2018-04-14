var express = require('express');
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var router = express.Router({mergeParams: true});
var middleware = require('../middleware');

// show new comment form
router.get("/new", middleware.isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, foundCampground){
    if(err || !foundCampground){
      req.flash('error', 'No campground found');
      res.redirect('back');
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  })
});

//create new comment
router.post("/", middleware.isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, foundCampground){
    if(err){
      console.log(err);
      req.flash('error', 'Something went wrong');
      res.redirect("/camgrounds");
    } else {
      Comment.create(req.body.comment, function(err, comment){
        if(err) {
          console.log(err);
        } else {
          // add username and id to comments
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          foundCampground.comments.push(comment);
          foundCampground.save();
          req.flash('success', 'Comment posted!');
          res.redirect("/campgrounds/" + foundCampground._id);
        }
      });
    }
  });
});

//SHOW comment update page
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res){
  // if someone tries to use invalid campground id
  // this will prevent the server shutdown
  Campground.findById(req.params.id, function(err, foundCampground) {
     if(err || !foundCampground){
       req.flash('error', 'Campground not found');
       res.redirect('back');
     } 
  });
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    res.render('comments/edit', {comment: foundComment, campground_id: req.params.id}); //not to pass the whole object
  });
});

//UPDATE comment logic
router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    res.redirect('/campgrounds/' + req.params.id);
  });
});

//DESTROY comment logic
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    req.flash('success', 'Comment deleted');
    res.redirect('/campgrounds/' + req.params.id);
  });
});

module.exports = router;