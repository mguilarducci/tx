'use strict';

var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  DriverModel = mongoose.model('Driver'),
  _ = require('lodash');

router.post('/location',  function(req, res) {
  if (!req.body.driverId || !req.body.latitude || !req.body.longitude) {
    return res.status(400).send();
  }

  DriverModel.findById(req.body.driverId, function(err, driver) {
    if (err || !driver) {
      return res.status(400).send();
    }

    driver = _.extend(driver, {
      driverAvailable: req.body.driverAvailable || false,
      lastLocation: [req.body.longitude, req.body.latitude]
    });

    driver.save(function(err) {
      if (err) {
        return res.status(400).send();
      }
      res.status(201).send();
    });
  });
});

module.exports = router;

