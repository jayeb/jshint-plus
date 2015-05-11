var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    chalk = require('chalk'),
    Table = require('easy-table'),
    logSymbols = require('log-symbols');

module.exports = {
  path: path.join(__dirname, 'jshint-plus.js'),
  reporter: function reporter(reportedErrors) {
      var notifierProcess,
          projectName,
          files = {},
          filesToOpen = [],
          notificationTitle,
          notificationMessage,
          consoleString = '',
          summaryString = '',
          summaryDir = '.tmp',
          summaryFile = 'jshint-errors.txt';

      if (reportedErrors.length) {
        // Guess project name
        try {
          projectName = require(process.cwd() + path.sep + 'package.json').name;
        } catch (e) {
          projectName = process.cwd().split(path.sep).pop();
        }

        // Build message
        _.each(reportedErrors, function reportedErrorLoop(reportedError) {
          var errorInfo;

          if (!files[reportedError.file]) {
            files[reportedError.file] = [];
            filesToOpen.push(reportedError.file + ':' + reportedError.error.line + ':' + reportedError.error.character);
          }

          errorInfo = {
            filename: _.last(reportedError.file.split(path.sep)),
            filepath: reportedError.file,
            line: reportedError.error.line,
            char: reportedError.error.character,
            reason: reportedError.error.reason,
            code: reportedError.error.code
          };

          files[reportedError.file].push(errorInfo);

          return errorInfo;
        });

        notificationTitle = projectName + ' - JSHint failed';
        notificationMessage = reportedErrors.length + ' error' + (reportedErrors.length === 1 ? '' : 's');

        if (_.size(files) === 1) {
          _.each(files, function fileLoop(fileErrors) {
            if (fileErrors.length === 1) {
              notificationMessage += ' at ' + [fileErrors[0].filename, fileErrors[0].line, fileErrors[0].char].join(':');
            } else {
              notificationMessage += ' in ' + fileErrors[0].filename;
            }
          });
        } else {
          notificationMessage += ' across ' + filesToOpen.length + ' files';
        }

        // Make data tables for the file output summary
        _.each(files, function fileLoop(fileErrors, filepath) {
          var consoleTable = new Table(),
              summaryTable = reportedErrors.length > 1 ? new Table() : undefined;

          _.each(fileErrors, function fileErrorLoop(fileErrors) {
            // Add console row
            consoleTable.cell('L', fileErrors.line, Table.Number(), 4);
            consoleTable.cell('C', fileErrors.char, Table.Number(), 3);
            consoleTable.cell('Reason', fileErrors.reason, function reasonPrinter(value) {
              if (fileErrors.code.charAt(0) === 'E') {
                return chalk.red(logSymbols.error + ' ' + value);
              } else if (fileErrors.code.charAt(0) === 'W') {
                return chalk.yellow(logSymbols.warning + ' ' + value);
              } else {
                return Table.string(value);
              }
            });
            consoleTable.newRow();

            if (reportedErrors.length > 1) {
              // Add summary row
              summaryTable.cell('L', fileErrors.line, Table.Number(), 4);
              summaryTable.cell('C', fileErrors.char, Table.Number(), 3);
              summaryTable.cell('Reason', fileErrors.reason);
              summaryTable.newRow();
            }
          });

          consoleString += '\n' + chalk.cyan(fileErrors.length + ' error' + (fileErrors.length === 1 ? '' : 's') + ' in ' + filepath + '\n');
          consoleString += consoleTable.print();

          if (reportedErrors.length > 1) {
            summaryString += filepath + ' - ';
            summaryString += reportedErrors.length + ' error' + (reportedErrors.length === 1 ? '' : 's') + '\n';
            summaryString += '\n' + summaryTable.print() + '\n\n';
          }
        });

        if (!!summaryString) {
          // If there's more than one error, write the message to a file and add it to the end of the list
          if (!fs.existsSync(summaryDir)) {
            fs.mkdirSync(summaryDir, 0766, function onMkdirError(err) {
              console.log(err);
            });
          }
          fs.writeFileSync(summaryDir + path.sep + summaryFile, summaryString);
          filesToOpen.push(summaryDir + path.sep + summaryFile);
        }

        notifierProcess = require('child_process').fork(path.join(__dirname, 'notifier.js'));

        notifierProcess.send({
          message: notificationMessage,
          title: notificationTitle,
          files: filesToOpen
        });

        console.log(consoleString);
      } else {
        console.log(logSymbols.success + ' No errors found.');
      }

    }
};
