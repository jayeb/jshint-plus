module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    name: '<%= pkg.name %>',

    // Javascript
    jshint: {
        src: '*.js',
        options: {
            jshintrc: '.jshintrc',
            reporter: './jshint-plus.js'
          }
      },
    jscs: {
        src: '*.js',
        options: {
            config: '.jscsrc'
          }
      }
  });
};
