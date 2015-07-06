'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TripSchema = new Schema({
  name: String,
  boatname: String,
  boatid: String,
  startdate: Date,
  enddate: Date,
  tripdate: Date,
  income: Number,
  diesel: Number,
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
  uuid: {type: String, default: "default"},
  created: {type: Date, default: new Date()},
  active: Boolean
});

module.exports = mongoose.model('Trip', TripSchema);