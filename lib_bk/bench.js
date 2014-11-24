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

  if (!this.overrides.minOps) {
    this.overrides.minOps = false;
  }

  this.opts = extend(this.opts, this.overrides);
  var opts = this.opts;

  var parent = this.suite.currentObject;
  this.suite.currentObject = this;

  if(!this.fn) {
    this.suite.currentObject = parent;
    yield this.timer.stop();
    return;
  }

  var i = 1;

  while (i <= opts.iterations) {
    if(opts.concurrency === 1) {
      yield this.execute(i);
    } else {
      var yieldArray = [];
      var j = 0;
      while (j < opts.concurrency && i + j < opts.iterations) {
        yieldArray.push(this.execute());
        j++;
      }
      yield yieldArray;
    }
    i += opts.concurrency;
  }

  this.suite.currentObject = parent;
  yield this.timer.stop();
};

/**
 * Executes a single concurrent run of the benchmark
 */
Bench.prototype.execute = function execute() {
  var _this = this;
  return function * execute() {
    var fn = _this.fn;
    var opts = _this.opts;
    var suite = _this.suite;

    if (suite.beforeEach) {
      yield _this.runBeforeEach(suite);
    }

    if (opts.before) {
      yield opts.before();
    }

    if (opts.delay) {
      yield gen.delay(opts.delay);
    }

    var timer = new Timer();

    try {
      timer.start();
      var res = yield * fn(timer);
      res = null;
      timer.stop();
      _this.runs.push(timer);
    } catch (e) {
      _this.runs.push({error: e});
    }

    if (opts.after) {
      yield opts.after();
    }

    if (suite.afterEach) {
      yield _this.runAfterEach(suite);
    }
  };
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

Bench.prototype.getResults = function * getResults() {
  var results = {
    name: this.name,
    timer: this.timer,
    runs: this.runs,
    minOps: this.opts.minOps
  };

  return results;
};

module.exports = Bench;
