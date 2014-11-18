'use strict';

var extend = require('util')._extend;
var gen = require('gen');

/**
 * Creates a new Bench object
 *
 * @param {Object} suite - The suite this benchmark belongs to
 * @param {String} name - The name of the benchmark
 * @param {Function} fn - The benchmark Function
 * @param {Object} opts - The options for the benchmark
 * @constructor
 */
function Bench(suite, name, fn, opts) {
  if (!opts) {
    opts = {};
  }
  this.suite = suite;
  this.name = name;
  this.fn = fn;
  this.opts = extend({}, this.suite.opts);
  if (this.opts.before) {
    delete this.opts.before;
  }
  if (this.opts.after) {
    delete this.opts.after;
  }
  this.overrides = opts;
}

/**
 * Runs the given benchmark for the needed number of iterations
 */
Bench.prototype.run = function * run() {
  this.opts = extend(this.opts, this.overrides);
  var opts = this.opts;

  var parent = this.suite.currentObject;
  this.suite.currentObject = this;

  if (this.fn) {
    var i = 1;
    while (i <= opts.iterations) {
      yield this.execute(this.fn, opts, this.suite);
      i += opts.concurrency;
    }
  }

  this.suite.currentObject = parent;
};

/**
 * Executes a single concurrent run of the benchmark
 *
 * @param {Function} fn - The benchmark function
 * @param {Object} opts - The options for the benchmark
 * @param {Object} suite - The suite this benchmark belongs to
 */
Bench.prototype.execute = function * execute(fn, opts, suite) {
  if (suite.beforeEach) {
    yield this.runBeforeEach(suite);
  }

  if (opts.before) {
    yield opts.before();
  }

  yield gen.delay(opts.delay);
  yield fn();

  if (opts.after) {
    yield opts.after();
  }

  if (suite.afterEach) {
   yield this.runAfterEach(suite);
  }
};

/**
 * Runs the beforeEach methods of the parent suite(s)
 *
 * @param {Object} suite - The suite this benchmark belongs to
 */
Bench.prototype.runBeforeEach = function * runBeforeEach(suite) {
  var i = 0;
  while (i < suite.beforeEach.length) {
    yield suite.beforeEach[i]();
    i++;
  }
};

/**
 * Runs the afterEach methods of the parent suite(s)
 *
 * @param {Object} suite - The suite this benchmark belongs to
 */
Bench.prototype.runAfterEach = function * runAfterEach(suite) {
  var i = 0;
  while (i < suite.afterEach.length) {
    yield suite.afterEach[i]();
    i++;
  }
};

module.exports = Bench;
