var path = require('path'),
    _ = require('lodash'),
    reporter = require('../lib/reporter.js');

module.exports = (function constructor() {
  var errorsByFile = {},
      dispatchToReporter;

  dispatchToReporter = _.debounce(_.partial(reporter, errorsByFile, 'jshint'), 100);

  return {
    reporter: function jshintReporter(reportedErrors) {
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

      dispatchToReporter();
    }
  };
})();

