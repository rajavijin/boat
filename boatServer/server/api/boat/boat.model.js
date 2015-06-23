'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BoatSchema = new Schema({
  boatname: String,
  owner: String,
  mobile: String,
  ownerpercentage: Number,
  workerpercentage: Number,
  bataperday: Number,
  active: Boolean,
  created: Date
});

module.exports = mongoose.model('Boat', BoatSchema);