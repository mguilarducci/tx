'use strict';
require('./config').loadModels()

var express = require('express'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  helmet = require('helmet'),
  app = express(),
  chalk = require('chalk'),
  env = require('./config/env')[process.env.NODE_ENV || 'development'],
  mongoose = require('mongoose'),
  mongodb = mongoose.connect(env.db);

mongodb.connection.on('error', function(err) {
  console.error(chalk.red('MongoDB error'));
  console.log(chalk.red(err));
});

mongodb.connection.once('open', function() {
  console.log('MongoDB is running!');
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.xssFilter());
app.use(helmet.xframe());
app.use(helmet.hidePoweredBy({ setTo: 'oi nenem' }));

require('./oauth2')(app);

app.get('/', function(req, res) {
  res.status(200).send({ ok: 'ok' });
});

app.use('/drivers', app.oauth.authorise(), require('./routes/drivers'));

module.exports = app;
