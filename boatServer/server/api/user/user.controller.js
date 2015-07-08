'use strict';
var _ = require('lodash');
var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var Boat = require('../boat/boat.model');
var Trip = require('../trip/trip.model');
var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  //Create student
  var userData = req.body;
  userData.provider = 'local';
  //userData.pepper = Math.random().toString(36).substring(10);
  userData.pepper = (req.body.email == 'demo') ? "demo" : Math.random().toString(36).substring(10);
  userData.password = userData.pepper;
  if(req.body.import) {
    console.log("Requested: ", userData);
    User.findOne({
      email:req.body.mobile,
    }, '-salt -hashedPassword', function(err, bUserData) {
      if (err) return validationError(res, err);
      if(bUserData) {
        var userUpdated = _.merge(bUserData, userData);
        userUpdated.save(function (err) {
          if (err) { return validationError(res, err); }
          console.log("User created");
          return res.json(200, bUserData); 
        });
      } else {
        var userStudent = new User(userData);
        userStudent.save(function(err, bUserData) {
          if (err) return validationError(res, err);
          console.log("Student Created");
          return res.json(bUserData);
        });      
      }
    });      
  } else { 
    User.findOne({
      email:req.body.mobile,
      boatid: req.body.boatid
    }, '-salt -hashedPassword', function(err, bUserData) {
      if (err) return validationError(res, err);
      if(bUserData) {
        var userUpdated = _.merge(bUserData, req.body);
        userUpdated.save(function (err) {
          if (err) { return validationError(res, err); }
          console.log("User updated");
          return res.json(200, bUserData); 
        });
      } else {
        var userStudent = new User(req.body);
        userStudent.save(function(err, bUserData) {
          if (err) return validationError(res, err);
          console.log("User Created");
          return res.json(bUserData);
        });      
      }
    });     
    /*var newUser = new User(userData);
    newUser.provider = "local";
    newUser.role = 'user';
    newUser.save(function(err, user) {
      if (err) return validationError(res, err);
      var studentUpdated = _.merge(bUserData, userData);
      studentUpdated.save(function (err) {
        if (err) { return validationError(res, err); }
        return res.json(200, bUserData);
      });
      var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
      res.json({ token: token });
    });*/
    /*var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.save(function(err, user) {
      if (err) return validationError(res, err);
      var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
      res.json({_id: user._id, name:user.name, salarylevel:user.salarylevel,email:user.email,role:user.role,mobile:user.mobile});
    });*/
  }  
};

/**
* Verify an user
*/
exports.verify = function(req, res, next) {
console.log('user', req.body); 
User.findOne({
    email: req.body.email
  }, '-pepper', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    if(user.authenticate(req.body.password)) {
      if (!user) return res.json(401);
      console.log("authenticated", user);
      User.find({boatid:user.boatid,role:{$ne:'owner'},active:true}, '_id name email role salarylevel mobile', function(err, members) {
        if(user.active) {
          var userdetails = { 
            _id: '55880b2426cfdfed3c704e48',
            role: user.role,
            email: user.email,
            name: user.name,
            boatname: user.boatname,
            boatid: user.boatid
          }
          userdetails.token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
          userdetails.members = members;
          Boat.findOne({_id:user.boatid}, function(err, boatDetails) {
            console.log("boat details", boatDetails);
            userdetails.ownerpercentage = boatDetails.ownerpercentage;
            userdetails.workerpercentage = boatDetails.workerpercentage;
            userdetails.bataperday = boatDetails.bataperday;
            userdetails.debt = boatDetails.debt;
            var months = [
              "Jan", "Feb", "Mar",
              "Apr", "May", "Jun", "Jul",
              "Aug", "Sep", "Oct",
              "Nov", "Dec"
            ];
            userdetails.filters = {years:{}};
            var tparams = {boatid:user.boatid};
            if((user.email == 'demo') && req.body.uuid) {
              var uuids = req.body.uuid.split(",");
              tparams.uuid = {$in:uuids};
            }
            Trip.find(tparams, 'startdate', {sort:{startdate:1}}, function(err, trips) {
              console.log("trips", trips);
              if(trips) {
                for (var i = 0; i < trips.length; i++) {
                  if(!userdetails.filters.years[trips[i].startdate.getFullYear()]) userdetails.filters.years[trips[i].startdate.getFullYear()] = {};
                  var fmonth = ("0" + (trips[i].startdate.getMonth() + 1)).slice(-2);
                  userdetails.filters.years[trips[i].startdate.getFullYear()][fmonth] = months[trips[i].startdate.getMonth()];
                  userdetails.filters.year = trips[i].startdate.getFullYear();
                  userdetails.filters.month = fmonth;
                }
                console.log("userdetails", userdetails);
                res.json(userdetails);
              } else {
                console.log("no trips");
                res.json(userdetails);
              }
            })
          })
        } else {
          res.json({status:"blocked"});
        }
      })
    } else {
      return res.json(401);
    }
  }); 
}
/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

// Get users
exports.allusers = function(req, res) {
  console.log("requested trips", req.params);
  req.params.role = {$ne:'owner'};
  req.params.active = true;
  User.find(req.params, '_id name email role salarylevel mobile', {sort:{salarylevel: 1}}, function (err, users) {
    if(err) { return handleError(res, err); }
    if(!users) { return res.send(404); }
    return res.json(users);
  });
};
/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

// Updates an existing trip in the DB.
exports.update = function(req, res) {
  console.log("req.body", req.body);
  if(req.body._id) { delete req.body._id; }
  User.findById(req.params.id, '_id name email role salarylevel mobile', function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.send(404); }
    var updated = _.merge(user, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, user);
    });
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
