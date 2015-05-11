module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    name: '<%= pkg.name %>',

    // Javascript
    jshint: {
        src: '{lib,jshint,jscs}/*.js',
        options: {
            jshintrc: '.jshintrc',
            reporter: 'jshint/jshint.js'
          }
      },
    jscs: {
        src: '{lib,jshint,jscs}/*.js',
        options: {
            config: '.jscsrc',
            reporter: require('./jscs/index.js').path
          }
      }
  });
};
