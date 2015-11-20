var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    chalk = require('chalk'),
    Table = require('easy-table'),
    logSymbols = require('log-symbols');

module.exports = {
  getConsoleOutput: function getConsoleOutput(errorsByFile, task) {
      var output = '';

      // Make data tables for the file output summary
      _.each(errorsByFile, function fileLoop(errors, filepath) {
        var table = new Table();

        _.each(errors, function errorLoop(error) {
          // Add console row
          table.cell('L', error.line, Table.Number(), 4);
          table.cell('C', error.char, Table.Number(), 3);
          table.cell('Reason', error.reason, function reasonPrinter(value) {
            if (error.isError) {
              return chalk.red(logSymbols.error + ' ' + value);
            } else if (error.isWarning) {
              return chalk.yellow(logSymbols.warning + ' ' + value);
            } else {
              return chalk.blue(logSymbols.info + ' ' + value);
            }
          });
          table.newRow();
        });

        output += '\n' + chalk.cyan(
          path.relative('.', filepath),
          '-',
          errors.length + ' report' + (errors.length === 1 ? '' : 's'),
          'from',
          task
        );
        output += '\n' + table.print();
      });

      return output;
    },

  getLogfileOutput: function getLogfileOutput(errorsByFile) {
      var output = '';

      _.each(errorsByFile, function fileLoop(errors, filepath) {
        var table = new Table();

        _.each(errors, function errorLoop(error) {
          // Add summary row
          table.cell('L', error.line, Table.Number(), 4);
          table.cell('C', error.char, Table.Number(), 3);
          table.cell('Reason', error.reason);
          table.newRow();
        });

        output += filepath + ' - ' + errors.length + ' report' + (errors.length === 1 ? '' : 's') + '\n';
        output += '\n' + table.print() + '\n\n';
      });

      return output;
    },

  writeLogFile: function writeLogFile(contents, filename, dir) {
      var filepath = path.join(dir, filename);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, 0766, function onMkdirError(err) {
          console.log(err);
          return false;
        });
      }

      fs.writeFileSync(filepath, contents);
      return filepath;
    },

  getNotificationTitle: function getNotificationTitle(task) {
      var projectName,
          title = '';

      try {
        projectName = require(process.cwd() + path.sep + 'package.json').name;
      } catch (e) {
        projectName = process.cwd().split(path.sep).pop();
      }

      if (projectName) {
        title += projectName + ' - ';
      }
      title += task + ' failed';

      return title;
    },

  getNotificationMessage: function getNotificationMessage(errorsByFile) {
      var message,
          fileCount = _.size(errorsByFile),
          errorCount = _.reduce(errorsByFile, function iteratee(total, errorsInFile) {
              return total + errorsInFile.length;
            }, 0);

      message = errorCount + ' report' + (errorCount === 1 ? '' : 's');

      if (fileCount === 1) {
        _.each(errorsByFile, function fileLoop(errorsInFile) {
          if (errorsInFile.length === 1) {
            message += ' at ' + [errorsInFile[0].filename, errorsInFile[0].line, errorsInFile[0].char].join(':');
          } else {
            message += ' in ' + errorsInFile[0].filename;
          }
        });
      } else {
        message += ' across ' + fileCount + ' files';
      }

      return message;
    },

  getNotificationFiles: function getNotificationFiles(errorsByFile) {
      var files = [];

      return _.map(errorsByFile, function mapFiles(errorsInFile, filepath) {
        var firstError = errorsInFile[0];

        return [filepath, firstError.line, firstError.char].join(':');
      });
    },

  makeNotification: function makeNotification(title, message, fileList) {
      var notifierProcess = require('child_process').fork(path.join(__dirname, 'notifier.js'));

      notifierProcess.send({
        title: title,
        message: message,
        files: fileList
      });
    }
};
