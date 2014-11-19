'use strict';

var extend = require('util')._extend;
var gen = require('gen');
var Timer = require('Timer');

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
  this.timer = new Timer();
  this.runs = [];
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
  yield this.timer.start();
  this.opts = extend(this.opts, this.overrides);
  var opts = this.opts;

  var parent = this.suite.currentObject;
  this.suite.currentObject = this;

  if (this.fn) {
    var i = 1;
    while (i <= opts.iterations) {
      yield this.execute();
      i += opts.concurrency;
    }
  }

  this.suite.currentObject = parent;
  yield this.timer.stop();
};

/**
 * Executes a single concurrent run of the benchmark
 */
Bench.prototype.execute = function * execute() {
  var fn = this.fn;
  var opts = this.opts;
  var suite = this.suite;

  try {
    if (suite.beforeEach) {
      yield this.runBeforeEach(suite);
    }

    if (opts.before) {
      yield opts.before();
    }

    yield gen.delay(opts.delay);

    var i = 0;
    var toYield = [];
    while (i < opts.concurrency) {
      var timer = new Timer();
      toYield.push(gen.run(this.execBench)(fn, timer, false).timeout(opts.timeout, 'Benchmark timed out'));
      this.runs.push(timer);
      i++;
    }

    yield toYield;

    if (opts.after) {
      yield opts.after();
    }

    if (suite.afterEach) {
     yield this.runAfterEach(suite);
    }

  } catch (e) {
    console.log(e);
    this.runs.push({error: e});
  }
};

Bench.prototype.execBench = function * execBench(fn, timer) {
  yield timer.start();
  yield fn();
  yield timer.stop();
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
