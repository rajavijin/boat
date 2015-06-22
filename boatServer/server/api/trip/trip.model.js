'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TripSchema = new Schema({
  name: String,
  boatname: String,
  boatid: String,
  startdate: Date,
  enddate: Date,
  income: Number,
  petrol: Number,
  ice: Number,
  net: Number,
  food: Number,
  extra: Number,
  members: Array,
  active: Boolean
});

module.exports = mongoose.model('Trip', TripSchema);