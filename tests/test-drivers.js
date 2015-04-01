'use strict';

var request = require('supertest'),
  app = require('../app.js'),
  agent = request(app),
  mongoose = require('mongoose'),
  OAuthClientModel = mongoose.model('Client'),
  OAuthUserModel = mongoose.model('User'),
  DriverModel = mongoose.model('Driver');

describe('Save driver location', function() {
  var client, user, credentials, driver,
    latitude = 45.61493741135093,
    longitude = -72.35595703125;

  before(function(done) {
    client = new OAuthClientModel({ clientId: 'clientId', clientSecret: 'clientSecret' });
    user = new OAuthUserModel({ username: 'username', password: 'passowrd' });
    driver = new DriverModel({ name: 'Robert De Niro', carPlate: 'AAA-1111' });

    credentials = {
      client_id: client.clientId,
      client_secret: client.clientSecret,
      username: user.username,
      password: user.password,
      grant_type: 'password'
    };

    client.save(function() {
      user.save(function() {
        driver.save(done);
      });
    });
  });

  after(function(done) {
    OAuthClientModel.remove({}).exec();
    OAuthUserModel.remove({}).exec();
    DriverModel.remove({}).exec();
    done();
  });

  it('should not save when the user is not autheticated', function(done) {
    agent.get('/secretarea')
      .end(function(err, res) {
        res.body.error_description.should.match(/The access token was not found/);
        done();
      });
  });

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
              driverUpdated.lastLocation[0].should.equal(longitude);
              driverUpdated.lastLocation[1].should.equal(latitude);
              driverUpdated.driverAvailable.should.equal(true);

              done();
            });
          });
      });
  });
});
