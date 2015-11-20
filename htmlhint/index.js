var path = require('path'),
    _ = require('lodash'),
    reporter = require('../lib/reporter.js');

module.exports = (function constructor() {
  var errorsByFile = {},
      dispatchToReporter;

  dispatchToReporter = _.debounce(_.partial(reporter, errorsByFile, 'htmlhint'), 50);

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

    return false;
  }
})();
