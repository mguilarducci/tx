'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    files: {
      js: ['**/*.js'],
      serverFile: ['Gruntfile.js', 'app.js', 'oauth2/**', 'tests/**', 'models/**', 'config/**', 'routes/** ']
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        ignores: ['node_modules/**']
      },
      uses_defaults: '<%= files.serverFile %>'
    },

    env: {
      test: {
        NODE_ENV: 'test'
      }
    },

    mochaTest: {
      src: ['tests/**/test-*.js'],
      options: {
        reporter: 'spec',
        require: ['app.js', 'should']
      }
    }
  });

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['jshint', 'env:test', 'mochaTest']);
};
