var path = require('path'),
    _ = require('lodash'),
    reporter = require('../lib/reporter');

module.exports = (function constructor() {
  var errorsByFile = {},
      dispatchToReporter;

  // Debounce calls to the reporter so all of the errors get cached before reporting
  dispatchToReporter = _.debounce(function reportErrors() {
    reporter(errorsByFile, 'jsonlint');

    // Clear errorsByFile so we don't send the same errors multiple times
    errorsByFile = {};
  }, 100);

  // JSONLint only returns one error per file
  return function jsonlintReporter(lint, file) {
    errorsByFile[file.path] = [{
      filename: _.last(file.path.split(path.sep)),
      filepath: file.path,
      line: lint.line,
      char: lint.character,
      reason: lint.error,
      isError: true,
      isWarning: false
    }];

    dispatchToReporter();
  }
})();
