var path = require('path'),
    _ = require('lodash'),
    reporter = require('../lib/reporter.js');

module.exports = (function constructor() {
  var errorsByFile = {},
      dispatchToReporter;

  // Debounce calls to the reporter so all of the errors get cached before reporting
  dispatchToReporter = _.debounce(_.partial(reporter, errorsByFile, 'jscs'), 100);

  return function jscsReporter(reportedErrors) {
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

    dispatchToReporter();
  }
})();

module.exports.path = __dirname;
