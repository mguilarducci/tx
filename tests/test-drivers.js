'use strict';

var request = require('supertest'),
  _ = require('lodash'),
  app = require('../app.js'),
  agent = request(app),
  mongoose = require('mongoose'),
  OAuthClientModel = mongoose.model('Client'),
  OAuthUserModel = mongoose.model('User'),
  DriverModel = mongoose.model('Driver');

describe('Drivers', function() {
  var client, user, credentials, driver, driverInArea,
    latitude = 45.61493741135093,
    longitude = -72.35595703125,
    sw = '45.001141,-73.010302',
    ne = '46.36209,-71.751708';

  beforeEach(function(done) {
    client = new OAuthClientModel({ clientId: 'clientId', clientSecret: 'clientSecret' });
    user = new OAuthUserModel({ username: 'username', password: 'password' });
    driver = new DriverModel({
      name: 'Robert De Niro',
      carPlate: 'AAA-1111',
      lastLocation: { type: 'Point', coordinates: [-72.56, 47.04] },
      driverAvailable: true
    });

    driverInArea = new DriverModel({
      name: 'Angelica',
      carPlate: 'AAA-1112',
      lastLocation: { type: 'Point', coordinates: [longitude, latitude] },
      driverAvailable: true
    });

    credentials = {
      client_id: client.clientId,
      client_secret: client.clientSecret,
      username: user.username,
      password: user.password,
      grant_type: 'password'
    };

    client.save(function() {
      user.save(function() {
        driver.save(function() {
          driverInArea.save(done);
        });
      });
    });
  });

  afterEach(function(done) {
    OAuthClientModel.remove({}).exec();
    OAuthUserModel.remove({}).exec();
    DriverModel.remove({}).exec();
    done();
  });

  describe('Save driver location', function() {
    it('should not save if the driver does not exist', function(done) {
      agent.post('/oauth/token')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(credentials)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          }

          var url = '/drivers/location?access_token=' + res.body.access_token;
          agent.post(url)
            .expect(400)
            .end(done);
        });
    });

    it('should save the current location', function(done) {
      agent.post('/oauth/token')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(credentials)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          }

          var url = '/drivers/location?access_token=' + res.body.access_token;
          agent.post(url)
            .send({
              latitude: latitude,
              longitude: longitude,
              driverId: driver._id,
              driverAvailable: true
            })
            .expect(201)
            .end(function(err, res) {
              if (err) {
                done(err);
              }

              DriverModel.findById(driver._id, function(err, driverUpdated) {
                driverUpdated.lastLocation.coordinates[0].should.equal(longitude);
                driverUpdated.lastLocation.coordinates[1].should.equal(latitude);
                driverUpdated.driverAvailable.should.equal(true);

                done();
              });
            });
        });
    });
  });

  describe('Driver inArea', function() {
    it('should not return not availables', function(done) {
      driver = _.extend(driver, { driverAvailable: false });
      driver.save(function() {
        agent.post('/oauth/token')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send(credentials)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              done(err);
            }

            var url = '/drivers/inarea?access_token=' + res.body.access_token + '&sw=' + sw + '&ne=' + ne;
            agent.get(url)
              .expect(200)
              .end(function(err, res) {
                if (err) {
                  done(err);
                }

                res.body.length.should.equal(1);
                done();
              });
          });
      });
    });

    it('should return only drivers inarea', function(done) {
      agent.post('/oauth/token')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(credentials)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          }

          var url = '/drivers/inarea?access_token=' + res.body.access_token + '&sw=' + sw + '&ne=' + ne;
          agent.get(url)
            .expect(200)
            .end(function(err, res) {
              if (err) {
                done(err);
              }

              res.body.length.should.equal(1);
              done();
            });
        });
    });

    it('should return correct object', function(done) {
      agent.post('/oauth/token')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(credentials)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          }

          var url = '/drivers/inarea?access_token=' + res.body.access_token + '&sw=' + sw + '&ne=' + ne;
          agent.get(url)
            .expect(200)
            .end(function(err, res) {
              if (err) {
                done(err);
              }
              res.body[0].latitude.should.equal(latitude);
              res.body[0].longitude.should.equal(longitude);
              res.body[0].driverAvailable.should.equal(true);
              res.body[0].driverId.should.equal(driverInArea.id);
              done();
            });
        });
    });
  });
});
