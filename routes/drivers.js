'use strict';

var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  DriverModel = mongoose.model('Driver'),
  _ = require('lodash');

router.post('/location',  function(req, res) {
  if (!req.body.driverId || !req.body.latitude || !req.body.longitude) {
    return res.status(400).send({ message: 'Parametros invalidos' });
  }

  DriverModel.findById(req.body.driverId, function(err, driver) {
    if (err) {
      return res.status(400).send({ message: 'Erro ao buscar driver' });
    }

    if (!driver) {
      return res.status(400).send({ message: 'Driver not found' });
    }

    driver = _.extend(driver, {
      driverAvailable: req.body.driverAvailable || false,
      lastLocation: { type: 'Point', coordinates: [Number(req.body.longitude), Number(req.body.latitude)] }
    });

    driver.save(function(err) {
      if (err) {
        return res.status(400).send({ message: 'Erro ao salvar driver' });
      }
      res.status(201).send();
    });
  });
});

router.get('/inarea', function(req, res) {
  if (!req.query.sw || !req.query.ne) {
    return res.status(400).send({ message: 'Parametros invalidos' });
  }

  var sw = req.query.sw.split(',').reverse().map(Number),
    ne = req.query.ne.split(',').reverse().map(Number);

  if (sw.length !== 2 || ne.length !== 2) {
    return res.status(400).send({ message: 'Parametros invalidos' });
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
      return res.status(400).send({ message: 'Erro ao buscar driver' });
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

router.get('/:driverId/status', function(req, res) {
  DriverModel.findById(req.params.driverId, function(err, driver) {
    if (err) {
      return res.status(400).send({ message: 'Erro ao buscar driver' });
    }

    if (!driver) {
      return res.status(400).send({ message: 'Driver not found' });
    }

    res.status(200).send({
      latitude: driver.lastLocation.coordinates[1],
      longitude: driver.lastLocation.coordinates[0],
      driverId: driver._id,
      driverAvailable: driver.driverAvailable
    });
  });
});

router.post('/', function(req, res) {
  var driver = new DriverModel(req.body);
  driver.lastLocation = undefined;

  driver.save(function(err) {
    if (err) {
      console.error(err);
      return res.status(400).send();
    }

    res.status(201).send(driver._id);
  });
});

module.exports = router;

