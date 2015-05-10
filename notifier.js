var _ = require('lodash'),
    notifier = require('node-notifier'),
    exec = require('child_process').execSync;

process.on('message', function(data) {
  notifier.notify({
    title: data.title,
    message: data.message,
    wait: true
  }, function() {
    _.defer(function() {
      process.exit();
    });
  });

  notifier.on('click', function() {
    exec('subl -s ' + data.files.join(' '));
  });
});
