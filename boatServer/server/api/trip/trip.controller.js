'use strict';

var _ = require('lodash');
var Trip = require('./trip.model');
var Boat = require('../boat/boat.model');
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
  console.log("requested trips", req.params);
  if(req.params.uuid == "undefined") {delete req.params.uuid;}
  else {var uuids = req.params.uuid.split(",");req.params.uuid = {$in:uuids};}

  Trip.find(req.params, null, {sort:{startdate: 1}}, function (err, trip) {
    if(err) { return handleError(res, err); }
    if(!trip) { return res.send(404); }
    return res.json(trip);
  });
};

// Get trips
exports.alltrips = function(req, res) {
  console.log("requested", req.params);
  var params = {boatid: req.params.boatid,tripdate:{$gte:req.params.start,$lte:req.params.end}};
  if(req.params.uuid == "undefined") {delete req.params.uuid;}
  else {var uuids = req.params.uuid.split(",");params.uuid = {$in:uuids};}
  console.log("params", params);
  Trip.find(params, null, {sort:{startdate: 1}}, function (err, trip) {
    if(err) { return handleError(res, err); }
    if(!trip) { return res.send(404); }
    return res.json(trip);
  });
};
// Creates a new trip in the DB.
exports.create = function(req, res) {
  //blocked
  //res.json(200, {status:"blocked"});
  console.log("requested", req.body);
  Trip.create(req.body, function(err, trip) {
    if(err) { return handleError(res, err); }
    if((req.body.debt > 0) || (req.body.debttaken > 0)) {
      Boat.findById(req.body.boatid, function (boaterr, boat) {
        if (boaterr) { return handleError(res, boaterr); }
        if(!boat) { return res.send(404); }
        var updateVal = {debt:req.body.debt};
        var updated = _.merge(boat, updateVal);
        updated.save(function (boaterr) {
          if (boaterr) { return handleError(res, boaterr); }
          return res.json(200, trip);
        });
      });
    } else {
      return res.json(200, trip);
    }
  });
};

// Updates an existing trip in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Trip.findById(req.params.id, function (err, trip) {
    if (err) { return handleError(res, err); }
    if(!trip) { return res.send(404); }
    var updated = _.merge(trip, req.body);
    updated.extra = [];
    for (var i = 0; i < req.body.extra.length; i++) {
      updated.extra.push(req.body.extra[i]);
    }
    updated.members = [];
    for (var mi = 0; mi < req.body.members.length; mi++) {
      updated.members.push(req.body.members[mi]);
    }
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      if((req.body.debt > 0) || (req.body.debttaken > 0)) {
        Boat.findById(req.body.boatid, function (boaterr, boat) {
          if (boaterr) { return handleError(res, boaterr); }
          if(!boat) { return res.send(404); }
          var bupdateVal = {debt:req.body.debt};
          var bupdated = _.merge(boat, bupdateVal);
          bupdated.save(function (boaterr) {
            if (boaterr) { return handleError(res, boaterr); }
            return res.json(200, trip);
          });
        });
      } else {
        return res.json(200, trip);
      }
    });
  });
};

// Deletes a trip from the DB.
exports.destroy = function(req, res) {
  Boat.findById(req.params.boatid, function (boaterr, boat) {
    if (boaterr) { return handleError(res, boaterr); }
    if(!boat) { return res.send(404); }
    var bupdateVal = {debt:req.params.debt};
    var bupdated = _.merge(boat, bupdateVal);
    bupdated.save(function (boaterr) {
      if (boaterr) { return handleError(res, boaterr); }
      Trip.findById(req.params.id, function (err, trip) {
        if(err) { return handleError(res, err); }
        if(!trip) { return res.send(404); }
        trip.remove(function(err) {
          if(err) { return handleError(res, err); }
          return res.send(204);
        });
      });
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}