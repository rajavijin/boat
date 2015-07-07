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
  income: {type: Number, default: 0},
  diesel: {type: Number, default: 0},
  ice: {type: Number, default: 0},
  net: {type: Number, default: 0},
  food: {type: Number, default: 0},
  extra: Array,
  bata: {type: Number, default: 0},
  members: Array,
  balance: {type: Number, default: 0},
  ownerincome: {type: Number, default: 0},
  workerincome: {type: Number, default: 0},
  totalspending: {type: Number, default: 0},
  ownerp: {type: Number, default: 0},
  workerp: {type: Number, default: 0},
  bataperday: {type: Number, default: 0},
  debttaken: {type: Number, default: 0},
  uuid: {type: String, default: "default"},
  created: {type: Date, default: new Date()},
  active: Boolean
});

module.exports = mongoose.model('Trip', TripSchema);