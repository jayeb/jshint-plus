var path = require('path'),
    _ = require('lodash'),
    reporter = require('../lib/reporter.js');

module.exports = {
  reporter: function jshintReporter(reportedErrors) {
    var errorsByFile = {};

    // Sort errors
    _.each(reportedErrors, function reportedErrorLoop(reportedError) {
      if (!errorsByFile[reportedError.file]) {
        errorsByFile[reportedError.file] = [];
      }

      errorsByFile[reportedError.file].push({
        filename: _.last(reportedError.file.split(path.sep)),
        filepath: reportedError.file,
        line: reportedError.error.line,
        char: reportedError.error.character,
        reason: reportedError.error.reason,
        isError: reportedError.error.code.charAt(0) === 'E',
        isWarning: reportedError.error.code.charAt(0) === 'W'
      });
    });

    reporter(errorsByFile, 'jshint');
  }
};
