module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    name: '<%= pkg.name %>',

    // Javascript
    jshint: {
        src: 'lib/*.js',
        options: {
            jshintrc: '.jshintrc',
            reporter: './lib/reporter.js'
          }
      },
    jscs: {
        src: 'lib/*.js',
        options: {
            config: '.jscsrc'
          }
      }
  });
};
