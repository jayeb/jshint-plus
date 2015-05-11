var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    Table = require('easy-table'),
    logSymbols = require('log-symbols');

module.exports = {
  path: __dirname + path.sep + 'jshint-plus.js',
  reporter: function (reportedErrors) {
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
          // package.json not found
          projectName = process.cwd().split(path.sep).pop();
        }

        // Build message
        _.each(reportedErrors, function(reportedError) {
          var errorInfo;

          if (!files[reportedError.file]) {
            files[reportedError.file] = [];
            filesToOpen.push(reportedError.file + ':' + reportedError.error.line +  ':' + reportedError.error.character);
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

        notificationTitle = projectName  + ' - JSHint failed';
        notificationMessage = reportedErrors.length + ' error' + (reportedErrors.length === 1 ? '' : 's');

        if (_.size(files) === 1) {
          _.each(files, function(fileErrors) {
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
        _.each(files, function(fileErrors, filepath) {
          var consoleTable = new Table(),
              summaryTable = reportedErrors.length > 1 ? new Table() : undefined;

          _.each(fileErrors, function(fileErrors) {
            // Add console row
            consoleTable.cell('L', fileErrors.line, Table.Number(), 4);
            consoleTable.cell('C', fileErrors.char, Table.Number(), 3);
            consoleTable.cell('Reason', fileErrors.reason, function(value) {
              if (fileErrors.code.charAt(0) === 'E') {
                return logSymbols.error + ' \033[31m' + String(value) + '\033[0m';
              } else if (fileErrors.code.charAt(0) === 'W') {
                return logSymbols.warning + ' \033[33m' + String(value) + '\033[0m';
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

          consoleString += '\033[37m' + filepath + '\033[0m\n';
          consoleString += consoleTable.print() + '\n';

          if (reportedErrors.length > 1) {
            summaryString += filepath + ' - ';
            summaryString += reportedErrors.length + ' error' + (reportedErrors.length === 1 ? '' : 's') + '\n';
            summaryString += '\n' + summaryTable.print() + '\n\n';
          }
        });

        if (!!summaryString) {
          // If there's more than one error, write the message to a file and add it to the end of the list
          if (!fs.existsSync(summaryDir)){
            fs.mkdirSync(summaryDir, 0766, function(err){
              console.log(err);
            });
          }
          fs.writeFileSync(summaryDir + path.sep + summaryFile, summaryString);
          filesToOpen.push(summaryDir + path.sep + summaryFile);
        }

        notifierProcess = require('child_process').fork('notifier.js');

        notifierProcess.send({
          message: notificationMessage,
          title: notificationTitle,
          files: filesToOpen
        });

        console.log('\033[36m' + notificationMessage + '\033[0m' + '\n');
        console.log(consoleString);
      } else {
        console.log(logSymbols.success + ' No errors found.');
      }
    }
};
