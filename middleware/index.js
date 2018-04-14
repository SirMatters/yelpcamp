var Campground = require("../models/campground")
var Comment = require("../models/comment")

var middlewareObj = {
  checkCampgroundOwnership: function(req, res, next){
    if(req.isAuthenticated()){
      Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground) {
          req.flash('error', 'Campground not found');
          res.redirect('back');
        } else {
          if(foundCampground.author.id.equals(req.user._id)){
            next();
          } else {
            req.flash('error', 'You can not modify not your campgrounds')
            res.redirect('/campgrounds/' + req.params.id);
          }
        }
      });
    } else {
      req.flash('error', 'You need to be logged in');
      res.redirect('/login');
    }
  },
  checkCommentOwnership: function(req, res, next){
    if(req.isAuthenticated()){
      Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err || !foundComment) {
          req.flash('error', 'Comment not found');
          res.redirect('back');
        } else {
          //does the user own the comment?
          if(foundComment.author.id.equals(req.user._id)){
            next();
          } else {
            req.flash('error', 'You can not modify not your comments');
            res.redirect('back');
          }
        }
      });
    } else {
      req.flash('error', 'You need to be logged in');
      res.redirect('back');
    }
  },
  isLoggedIn: function(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    req.flash('error', 'Please, login first!');
    res.redirect('/login');
  }
};

module.exports = middlewareObj;