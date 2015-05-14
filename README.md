# Reporter Plus

Reporter Plus is a reporter script for JSHint and JSCS with stylized output and notifications.

## Whazzat

Reporter Plus is designed to reduce the amount of cmd+tabbing around you've got to do while linting and fixing your code. The ideal workflow (in my humble opinion), is to set up JSHint and JSCS to check on save with a watch task (try [grunt-contrib-watch](https://github.com/gruntjs/grunt-contrib-watch)) and a git pre-commit hook (try [precommit-hook](https://github.com/nlf/precommit-hook)).

When you save a watched file or attempt to make a commit with a mistake in it, Reporter Plus will send a notification. Clicking on the notification will open all of the relevant files, as well as a text file with a summary of all the errors in the report.

This repo doesn't have a watch task, but take a look at the `package.json` and `Gruntfile.js` to see an example of the pre-commit hook in situ.

Reporter Plus also provides some nicer formatting for the command-line output than the default reporters, heavily influenced by [jshint-stylish](https://github.com/sindresorhus/jshint-stylish).

## Requirements
* Node
* [JSHint](http://jshint.com/) or [JSCS](http://jscs.info/) or both

Also, if you want to open reports directly from notifications, you'll probably want to configure your `EDITOR` environment variable. For example, here's how to do so for Sublime Text: https://www.sublimetext.com/docs/2/osx_command_line.html

## Installation and setup
Install with `npm install --save-dev jayeb/reporter-plus`

To run from command line:

```bash
$ jshint --reporter=jshint/jshint.js ./lib

# or...

$ jscs --reporter=jscs/index.js ./lib
```

Or, if you're using [grunt-contrib-jshint](https://github.com/gruntjs/grunt-contrib-jshint) or [grunt-jscs](https://github.com/jscs-dev/grunt-jscs), you can put something like this in your Gruntfile:

```js
grunt.initConfig({
  jshint: {
      src: '*.js',
      options: {
          jshintrc: '.jshintrc',
          reporter: require('reporter-plus/jshint')
        }
    },
  jscs: {
      src: '*.js',
      options: {
          config: '.jscsrc',
          reporter: require('reporter-plus/jscs').path
        }
    }
});
```

You'll notice that the protocol for referencing the reporter is different between JSHint and JSCS. I don't know, man, that's just the way it is. Some things will never change.

[Ah, but don't you believe them.](https://www.youtube.com/watch?v=cOeKidp-iWo)