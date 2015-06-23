'use strict';

var _ = require('lodash');
var Boat = require('./boat.model');
var User = require('../user/user.model');

// Get list of boats
exports.index = function(req, res) {
  Boat.find(function (err, boats) {
    if(err) { return handleError(res, err); }
    return res.json(200, boats);
  });
};

// Get a single boat
exports.show = function(req, res) {
  Boat.findById(req.params.id, function (err, boat) {
    if(err) { return handleError(res, err); }
    if(!boat) { return res.send(404); }
    return res.json(boat);
  });
};

// Creates a new boat in the DB.
exports.create = function(req, res) {
  Boat.findOne({
    mobile:req.body.mobile,
  }, function(err, boatData) {
    console.log("boatData", boatData);
    if(boatData) {
      var updated = _.merge(boatData, req.body);
      updated.save(function (err) {
        if (err) { return handleError(res, err); }
        return res.json(200, boatData);
      });
    } else {
      Boat.create(req.body, function(err, boat) {
        if(err) { return handleError(res, err); }
        return res.json(boat);
        /*var newHm = new User(hm);
        newHm.save(function(err, boatdata) {
          if(err) { return handleError(res, err); }
          return res.json(201, boat);            
        });*/
      });   
    }
  });  
};

// Updates an existing boat in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Boat.findById(req.params.id, function (err, boat) {
    if (err) { return handleError(res, err); }
    if(!boat) { return res.send(404); }
    var updated = _.merge(boat, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, boat);
    });
  });
};

// Deletes a boat from the DB.
exports.destroy = function(req, res) {
  Boat.findById(req.params.id, function (err, boat) {
    if(err) { return handleError(res, err); }
    if(!boat) { return res.send(404); }
    boat.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}