var path = require('path'),
    _ = require('lodash'),
    reporter = require('../lib/reporter.js');

module.exports = function constructor() {
  var errorsByFile = {},
      dispatchToReporter;

  dispatchToReporter = _.debounce(_.partial(reporter, errorsByFile, 'postcss'), 50);

  // The PostCSS reporter only returns errors one file at a time
  return function postcssReporter(css, result) {
    var file,
        messagesToClear = [];

    if (result.messages.length) {
      _.each(result.messages, function reportedErrorLoop(message) {
        var file = _.get(message, 'node.source.input.file');

        if (file) {
          if (!errorsByFile[file]) {
            errorsByFile[file] = [];
          }

          errorsByFile[file].push({
            filename: _.last(file.split(path.sep)),
            filepath: file,
            line: message.line,
            char: message.column,
            reason: message.text,
            isError: message.type === 'error',
            isWarning: message.type === 'warning'
          });

          messagesToClear.push(message);
        }
      });

      // Clear the messages out for gulp-postcss doesn't double-log them
      result.messages = _.difference(result.messages, messagesToClear);

      dispatchToReporter();
    }
  }
};
