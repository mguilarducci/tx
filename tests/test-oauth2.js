'use strict';

var request = require('supertest'),
  app = require('../app.js');

describe('oauth2', function() {
  it('should send an error if token is null', function(done) {
    request(app)
      .get('/secretarea')
      .end(function(err, res) {
        res.body.error_description.should.match(/The access token was not found/);
        done();
      });
  });
});
