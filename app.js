'use strict';

var express = require('express'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  app = express(),
  chalk = require('chalk'),
  env = require('./config/env')[process.env.NODE_ENV || 'development'],
  mongoose = require('mongoose'),
  mongodb = mongoose.connect(env.db),
  config = require('./config');;

mongodb.connection.on('error', function(err) {
  console.error(chalk.red('MongoDB error'));
  console.log(chalk.red(err));
});

mongodb.connection.once('open', function() {
  console.log('MongoDB is running!');
});

config.loadModels();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./oauth2')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});

module.exports = app;
