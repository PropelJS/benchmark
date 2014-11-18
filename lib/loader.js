'use strict';

var fsp = require('co-fs-plus');
var fs = require('co-fs');
var path = require('path');
var gen = require('gen');
var run = gen.run;
var Runner = require('./runner');
var Reporter = require('./reporter');

function loader(opts, cb) {
  return run(function * loader() {
    var fileStats = yield gen.resume(fs.stat)(opts.path);

    opts.pathType = 'file';

    if (fileStats.isDirectory()) {
      opts.pathType = 'directory';
    }

    var runner = new Runner(opts);
    runner.setup();

    if(opts.pathType === 'file') {
      yield runner.loadFiles(path.resolve('./', opts.path));
    } else {
      // get each filename into an array
      var files = yield fsp.walk(opts.path, {
        followSymlinks: true,
        filterFilename: this._filterFileNames
      });

      // if there are no files throw an error
      if(files.length === 0) {
        throw new Error('No test files found in ' + opts.path);
      }

      // run the tests for each file found
      var i = 0;
      while(i < files.length) {
        yield runner.loadFiles(path.resolve('./', files[i]));
        i++;
      }

      // run the suites
      yield runner.run();

      // get the results as an Object
      var results = yield runner.results();

      // Output the results if needed
      if(opts.cli && !opts.silent) {
        var reporter = new Reporter(opts.reporter);
//        yield reporter.output(opts.reporter);
      }

      return results;
    }
  })(cb);
}

Runner.prototype._filterFileNames = function _filterFileNames(filename) {
  var ext = path.extname(filename);

  if (ext === '.js') {
    return true;
  }

  return false;
};

module.exports = loader;