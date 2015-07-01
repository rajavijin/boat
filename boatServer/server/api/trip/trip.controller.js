'use strict';

var _ = require('lodash');
var Trip = require('./trip.model');

// Get list of trips
exports.index = function(req, res) {
  Trip.find(function (err, trips) {
    if(err) { return handleError(res, err); }
    return res.json(200, trips);
  });
};

// Get a single trip
exports.show = function(req, res) {
  console.log("params", req.params);
  Trip.findById(req.params.id, function (err, trip) {
    if(err) { return handleError(res, err); }
    if(!trip) { return res.send(404); }
    return res.json(trip);
  });
};

// Get trips
exports.trips = function(req, res) {
  Trip.find({boatid: req.params.boatid}, null, {sort:{startdate: 1}}, function (err, trip) {
    if(err) { return handleError(res, err); }
    if(!trip) { return res.send(404); }
    return res.json(trip);
  });
};

// Get trips
exports.alltrips = function(req, res) {
  Trip.find({boatid: req.params.boatid,startdate:{$gte:req.params.start,$lte:req.params.end}}, null, {sort:{startdate: 1}}, function (err, trip) {
    if(err) { return handleError(res, err); }
    if(!trip) { return res.send(404); }
    return res.json(trip);
  });
};
// Creates a new trip in the DB.
exports.create = function(req, res) {
  console.log("requested", req.body);
  Trip.create(req.body, function(err, trip) {
    console.log("Trip", trip);
    console.log("Trip add error:", err);
    if(err) { return handleError(res, err); }
    return res.json(201, trip);
  });
};

// Updates an existing trip in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Trip.findById(req.params.id, function (err, trip) {
    if (err) { return handleError(res, err); }
    if(!trip) { return res.send(404); }
    console.log("requested", req.body);
    trip.members = [];
    trip.extra = [];
    var updated = _.merge(trip, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, trip);
    });
  });
};

// Deletes a trip from the DB.
exports.destroy = function(req, res) {
  Trip.findById(req.params.id, function (err, trip) {
    if(err) { return handleError(res, err); }
    if(!trip) { return res.send(404); }
    trip.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}