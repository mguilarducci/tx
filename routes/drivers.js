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
      lastLocation: { type: 'Point', coordinates: [req.body.longitude, req.body.latitude] }
    });

    driver.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      res.status(201).send();
    });
  });
});

router.get('/inarea', function(req, res) {
  if (!req.query.sw || !req.query.ne) {
    return res.status(400).send();
  }

  var sw = req.query.sw.split(',').reverse().map(Number),
    ne = req.query.ne.split(',').reverse().map(Number);

  if (sw.length !== 2 || ne.length !== 2) {
    return res.status(400).send();
  }

  var where = {
    driverAvailable: true,
    lastLocation: {
      $geoWithin: {
        $box: [sw, ne]
      }
    }
  };

  DriverModel.find(where, function(err, drivers) {
    if (err) {
      return res.status(400).send();
    }

    // horroroso
    var result = [];
    drivers.forEach(function(driver) {
      result.push({
        latitude: driver.lastLocation.coordinates[1],
        longitude: driver.lastLocation.coordinates[0],
        driverId: driver._id,
        driverAvailable: true
      });
    });
    res.status(200).send(result);
  });
});

module.exports = router;

