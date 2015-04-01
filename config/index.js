'use strict';

var glob = require('glob'),
  path = require('path');

module.exports = {
  loadModels: function() {
    var modelFiles = glob.sync('./models/*.js');
    modelFiles.forEach(function(modelPath) {
      require(path.resolve(modelPath));
    });
  }
};
