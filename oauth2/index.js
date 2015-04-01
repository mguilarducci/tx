'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  oauthserver = require('oauth2-server');

var OAuthAccessTokensSchema = new Schema({
  accessToken: { type: String },
  clientId: { type: String },
  userId: { type: String },
  expires: { type: Date }
});

var OAuthClientsSchema = new Schema({
  clientId: { type: String },
  clientSecret: { type: String },
  redirectUri: { type: String }
});

var OAuthUsersSchema = new Schema({
  username: { type: String },
  password: { type: String }
});

mongoose.model('AccessToken', OAuthAccessTokensSchema);
mongoose.model('Client', OAuthClientsSchema);
mongoose.model('User', OAuthUsersSchema);

var OAuthAccessTokensModel = mongoose.model('AccessToken'),
  OAuthClientsModel = mongoose.model('Client'),
  OAuthUsersModel = mongoose.model('User'),
  authorizedClientIds = ['99taxis', 'clientId'];

var oauth2 = {
  getAccessToken: function (bearerToken, callback) {
    console.log('in getAccessToken (bearerToken: ' + bearerToken + ')');

    OAuthAccessTokensModel.findOne({ accessToken: bearerToken }, callback);
  },

  getClient: function (clientId, clientSecret, callback) {
    console.log('in getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');
    if (clientSecret === null) {
      return OAuthClientsModel.findOne({ clientId: clientId }, callback);
    }
    OAuthClientsModel.findOne({ clientId: clientId, clientSecret: clientSecret }, callback);
  },


  grantTypeAllowed: function (clientId, grantType, callback) {
    console.log('in grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');

    if (grantType === 'password') {
      return callback(false, authorizedClientIds.indexOf(clientId) >= 0);
    }

    callback(false, true);
  },

  saveAccessToken: function (token, clientId, expires, userId, callback) {
    console.log('in saveAccessToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');

    var accessToken = new OAuthAccessTokensModel({
      accessToken: token,
      clientId: clientId,
      userId: userId,
      expires: expires
    });

    accessToken.save(callback);
  },

  getUser: function (username, password, callback) {
    console.log('in getUser (username: ' + username + ', password: ' + password + ')');

    OAuthUsersModel.findOne({ username: username, password: password }, function(err, user) {
      if(err) return callback(err);
      callback(null, user._id);
    });
  }
};

module.exports = function(app) {
  app.oauth = oauthserver({
    model: Object.create(oauth2),
    grants: ['password'],
    debug: true
  });

  app.all('/oauth/token', app.oauth.grant());

  app.get('/secretarea', app.oauth.authorise(), function (req, res) {
    res.send('Secret area');
  });

  app.use(app.oauth.errorHandler());
};
