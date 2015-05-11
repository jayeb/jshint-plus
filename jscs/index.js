var path = require('path'),
    _ = require('lodash'),
    reporter = require('../lib/reporter.js');

module.exports = function jscsReporter(reportedErrors) {
  var errorsByFile = {};

  // Sort errors
  _.each(reportedErrors, function reportedErrorLoop(errors) {
    _.each(errors.getErrorList(), function errorListLoop(error, i) {
      if (!errorsByFile[error.filename]) {
        errorsByFile[error.filename] = [];
      }

      errorsByFile[error.filename].push({
        filename: _.last(error.filename.split(path.sep)),
        filepath: error.filename,
        line: error.line,
        char: error.column,
        reason: error.message,
        isWarning: true
      });
    });
  });

  reporter(errorsByFile, 'jscs');
};

module.exports.path = __dirname;
