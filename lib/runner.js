'use strict';

let Suite = require('./suite');
let Timer = require('Timer');
let Reporter = require('./reporter');

/**
 * Instantiates a new benchmark runner
 *
 * @param {Object} opts - The options for the runner
 * @constructor
 */
function Runner(opts) {
  this.opts = opts;
  this.reporter = new Reporter(opts.reporter);
}

/**
 * Binds the global functions suite and bench
 */
Runner.prototype.setup = function setup() {
  global.suite = this.suite.bind(this);
  global.bench = this.bench.bind(this);
  this.root = new Suite(this);
  this.currentSuite = this.root;
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
 * Runs the entire benchmark suite
 */
Runner.prototype.run = function * run() {
  let results = yield this.root.run(this);
  return results;
};

module.exports = Runner;
