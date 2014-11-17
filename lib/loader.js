'use strict';

var fs = require('fs');
var Runner = require('./runner');

function loader(opts) {
  // figure out what files to load
  try {
    var fileStats = fs.statSync(opts.path);
    if (fileStats.isDirectory()) {
      opts.pathType = 'directory';
    } else {
      opts.pathType = 'file';
    }
  } catch (e) {
    throw new Error(opts.path + ' doesn\'t exist');
  }

  var runner = new Runner(opts);
  runner.setup();

  if(opts.pathType === 'file') {
    runner.run(opts.path);
  } else {
    // get each filename into an array

    // if there are no files throw an error
  }

//  return runner.results();
  if(!opts.cli && !opts.silent) {
    // output the report in the cli format asked for
  }

  // return the output as JSON only and throw any needed errors

}

module.exports = loader;
