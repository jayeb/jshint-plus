var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    Table = require('easy-table'),
    logSymbols = require('log-symbols');

module.exports = {
  reporter: function (errors) {
      var notifierProcess,
          projectName,
          files = {},
          filesToOpen = [],
          notificationTitle,
          notificationMessage,
          summaryFile = './.tmp/jshint-errors.txt',
          summaryString = '',
          consoleString = '';

      if (errors.length) {
        // Guess project name
        try {
          projectName = require(process.cwd() + path.sep + 'package.json').name;
        } catch (e) {
          // package.json not found
          projectName = process.cwd().split(path.sep).pop();
        }

        // Build message
        _.each(errors, function(info, i) {
          var errorInfo;

          if (!files[info.file]) {
            files[info.file] = [];
            filesToOpen.push(info.file + ':' + info.error.line +  ':' + info.error.line);
          }

          errorInfo = {
            filename: _.last(info.file.split('/')),
            filepath: info.file,
            line: info.error.line,
            char: info.error.character,
            reason: info.error.reason,
            code: info.error.code
          };

          files[info.file].push(errorInfo);

          return errorInfo;
        });

        notificationTitle = projectName  + ' - JSHint failed';
        notificationMessage = errors.length + ' error' + (errors.length === 1 ? '' : 's');

        if (_.size(files) === 1) {
          _.each(files, function(info) {
            if (errors.length === 1) {
              notificationMessage += ' at ' + [info.file, info.line, info.char].join(':');
            } else {
              notificationMessage += ' in ' + info.file;
            }
          });
        } else {
          notificationMessage += ' across ' + filesToOpen.length + ' files';
        }

        // Make a table of data for the file output summary

        _.each(files, function(errors, filepath) {
          var summaryTable = new Table,
              consoleTable = new Table;

          _.each(errors, function(error) {
            // Add summary row
            summaryTable.cell('L', error.line, Table.Number(), 4);
            summaryTable.cell('C', error.char, Table.Number(), 4);
            summaryTable.cell('Reason', error.reason);
            summaryTable.newRow();

            // Add console row
            consoleTable.cell('L', error.line, Table.Number(), 4);
            consoleTable.cell('C', error.char, Table.Number(), 4);
            consoleTable.cell('Reason', error.reason, function(value) {
              if (error.code.charAt(0) === 'E') {
                return logSymbols.error + ' \033[31m' + String(value) + '\033[0m';
              } else if (error.code.charAt(0) === 'W') {
                return logSymbols.warning + ' \033[33m' + String(value) + '\033[0m';
              } else {
                return Table.string(value);
              }
            });
            consoleTable.newRow();
          });

          summaryString += filepath + ' - ';
          summaryString += errors.length + ' error' + (errors.length === 1 ? '' : 's') + '\n';
          summaryString += '\n' + summaryTable.print() + '\n\n';

          consoleString += '\033[37m' + filepath + '\033[0m\n';
          consoleString += consoleTable.print() + '\n';
        });

        // Write the message to a file and add it to the end of the list
        fs.writeFileSync(summaryFile, summaryString);
        filesToOpen.push(summaryFile);

        notifierProcess = require('child_process').fork('notifier')

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
