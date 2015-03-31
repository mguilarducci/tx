'use strict';

var glob = require('glob'),
  path = require('path');

module.exports = {
  loadModels: function() {
    glob('./models/*.js', function(err, files) {
      files.forEach(function(file) {
        console.log(path.resolve(file));
        require(path.resolve(file));
      });

      console.log('Models loaded!');
    });
  }
};
