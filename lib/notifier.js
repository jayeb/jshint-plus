var _ = require('lodash'),
    notifier = require('node-notifier'),
    exec = require('child_process').execSync;

process.on('message', function onMessage(data) {
  notifier.notify({
    title: data.title,
    message: data.message,
    wait: true
  }, function callback() {
    _.defer(function deferredExit() {
      process.exit();
    });
  });

  notifier.on('click', function onClick() {
    var editor = process.env.EDITOR || 'subl';
    exec(editor + ' ' + data.files.join(' '));
  });
});
