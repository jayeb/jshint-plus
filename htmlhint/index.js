var path = require('path'),
    _ = require('lodash'),
    reporter = require('../lib/reporter.js');

module.exports = (function constructor() {
  var errorsByFile = {},
      dispatchToReporter;

  // Debounce calls to the reporter so all of the errors get cached before reporting
  dispatchToReporter = _.debounce(_.partial(reporter, errorsByFile, 'htmlhint'), 500);

  return function htmlhintReporter(file) {
    errorsByFile[file.path] = _.map(file.htmlhint.messages, function reportedErrorLoop(message) {
      var reportedError = message.error;

      return {
        filename: _.last(file.path.split(path.sep)),
        filepath: file.path,
        line: reportedError.line,
        char: reportedError.col,
        reason: reportedError.message,
        isError: reportedError.type === 'error',
        isWarning: reportedError.type === 'warning'
      };
    });

    dispatchToReporter();
  }
})();
