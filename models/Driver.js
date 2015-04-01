'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var DriverSchema = new Schema({
  name: { type: String, required: true },
  carPlate: { type: String, required: true },
  driverAvailable: Boolean,
  lastLocation: { type: [Number], index: '2dsphere' }
});

mongoose.model('Driver', DriverSchema);
var Driver = mongoose.model('Driver');

Driver.schema.path('carPlate').validate(function (value) {
  return /[a-zA-Z]{3}\-\d{4}/i.test(value);
}, 'Invalid carPlate');
