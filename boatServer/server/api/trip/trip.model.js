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
  extra: Array,
  bata: Number,
  members: Array,
  balance: Number,
  ownerincome: Number,
  workerincome: Number,
  totalspending: Number,
  ownerp: Number,
  workerp: Number,
  bataperday: Number,
  active: Boolean
});

module.exports = mongoose.model('Trip', TripSchema);