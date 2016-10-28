var path = require('path'),
    _ = require('lodash'),
    reporter = require('../lib/reporter.js');

module.exports = (function constructor() {
  var errorsByFile = {},
      dispatchToReporter;

  // Debounce calls to the reporter so all of the errors get cached before reporting
  dispatchToReporter = _.debounce(function reportErrors() {
    reporter(errorsByFile, 'yamllint');

    // Clear errorsByFile so we don't send the same errors multiple times
    errorsByFile = {};
  }, 100);

  return function yamllintReporter(reportedErrors) {
    // Sort errors
    _.each(reportedErrors, function reportedErrorLoop(error) {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }

      errorsByFile[error.file].push({
        filename: _.last(error.file.split(path.sep)),
        filepath: error.file,
        line: error.line,
        char: error.column,
        reason: error.message,
        isError: true
      });
    });

    dispatchToReporter();
  }
})();

module.exports.path = __dirname;
