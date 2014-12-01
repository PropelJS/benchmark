'use strict';

let gen = require('gen');
let run = gen.run;
let fs = require('fs');
let path = require('path');
let fsp = require('co-fs-plus');
let Runner = require('./runner');

/**
 * Runs the loader generator function
 *
 * @param {Object} opts - The options for the runner
 * @param {Function||null} cb - Optional Callback
 * @return {Object} results - Returns the results either through the callback or as a promise
 */
function loader(opts, cb) {
  return run(loaderGen)(opts, cb);
}

/**
 * Loads the benchmark files and handles the overall control flow
 *
 * @param {Object} opts - The options for the runner
= * @return {Object} results - Returns the results
 */
function * loaderGen(opts) {
  let fileStats = yield gen.resume(fs.stat)(opts.path);

  let runner = new Runner(opts);
  runner.setup();

  let files = [];

  if (fileStats.isFile()) {
    files.push(opts.path);
  } else {
    // get each filename into an array
    files = yield fsp.walk(opts.path, {
      followSymlinks: true, filterFilename: filterFileNames
    });
  }

  // if there are no files throw an error
  if (files.length === 0) {
    throw new Error('No test files found in ' + opts.path);
  }

  // require each file to setup the benchmarks
  files.forEach(function(file) {
    require(path.resolve('./', file));
  });

  // run the suites
  return yield runner.run();
}

/**
 * Filters files to only include .js files
 *
 * @param {String} filename - the name of the file to test
 * @return {boolean} - Whether the file should be included or not
 * @private
 */
function filterFileNames(filename) {
  let ext = path.extname(filename);

  return ext === '.js';
}

module.exports = loader;
