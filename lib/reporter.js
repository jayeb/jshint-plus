var _ = require('lodash'),
    logSymbols = require('log-symbols'),
    utils = require('../lib/utils.js');

module.exports = function reporter(errorsByFile, task) {
  var errorCount,
      consoleOutput,
      notificationFiles,
      logfileContents,
      logfilePath;

  errorCount = _.reduce(errorsByFile, function iteratee(total, errorsInFile) {
    return total + errorsInFile.length;
  }, 0);

  if (!errorCount) {
    console.log(logSymbols.success + ' Everything looks good!');
    return;
  }

  // Report errors to console
  consoleOutput = utils.getConsoleOutput(errorsByFile);
  console.log(consoleOutput);

  // Get a list of files for the notification to open upon click
  notificationFiles = utils.getNotificationFiles(errorsByFile);

  // Don't bother with the log file if there's only one error
  if (errorCount > 1) {
    logfileContents = utils.getLogfileOutput(errorsByFile);
    logfilePath = utils.writeLogFile(logfileContents, task + '-reports.txt', '.tmp');

    if (!!logfilePath) {
      notificationFiles.push(logfilePath);
    }
  }

  utils.makeNotification(
    utils.getNotificationTitle(task),
    utils.getNotificationMessage(errorsByFile),
    notificationFiles
  );
};
