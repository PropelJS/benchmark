'use strict';

var Suite = require('./suite');

/**
 * Instantiates a new benchmark runner
 *
 * @param {Object} opts - The options for the runner
 * @constructor
 */
function Runner(opts) {
  this.root = new Suite(this);
  this.suites = {};
  this.opts = opts;
  this.currentSuite = this.root;
}

/**
 * Binds the global functions suite and bench
 */
Runner.prototype.setup = function setup() {
  global.suite = this.suite.bind(this);
  global.bench = this.bench.bind(this);
};

/**
 * The global suite function
 *
 * @param {String} name - The name of the suite to create
 * @param {Function} fn - The function for the suite
 * @param {Object} opts - Options for the suite
 */
Runner.prototype.suite = function suite(name, fn, opts) {
  this.currentSuite.addSuite(name, fn, opts);
};

/**
 * The global bench function
 *
 * @param {String} name - The name of the bench to create
 * @param {Function} fn - The function for the benchmark
 * @param {Object} opts - Options for the benchmark
 */
Runner.prototype.bench = function bench(name, fn, opts) {
  this.currentSuite.addBench(name, fn, opts);
};

/**
 * Requires the passed in file
 *
 * @param {String} file - The file to load
 */
Runner.prototype.loadFiles = function * loadFiles(file) {
  require(file);
};

/**
 * Runs the entire benchmark suite
 */
Runner.prototype.run = function * run() {
  yield this.root.run();
};

/**
 * Returns the results in object format
 */
Runner.prototype.results = function * results() {
  var results = yield this.root.getResults();
  console.log(results.suites[0]);
};

module.exports = Runner;
