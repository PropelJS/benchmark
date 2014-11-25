'use strict';

let extend = require('util')._extend;
let gen = require('gen');
let Timer = require('Timer');
var Stats = require('fast-stats').Stats;

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
  this.suite = suite;
  this.name = name;
  this.fn = fn;
  this.timer = new Timer();
  this.reporter = suite.reporter;
  this.runs = [];
  if (!opts) {
    opts = {};
  }
  if (!opts.before) {
    opts.before = false;
  }
  if (!opts.after) {
    opts.after = false;
  }
  if (!opts.beforeEach) {
    opts.beforeEach = false;
  }
  if (!opts.afterEach) {
    opts.afterEach = false;
  }
  let parentOpts = extend({}, this.suite.opts);
  this.opts = extend(parentOpts, opts);
}

/**
 * Runs the given benchmark for the needed number of iterations
 */
Bench.prototype.run = function * run() {
  let opts = this.opts;

  yield this.timer.start();

  let previous = this.suite.currentObject;
  this.suite.currentObject = this;

  if(!this.fn) {
    this.suite.currentObject = parent;
    yield this.timer.stop();
    return;
  }

  if (opts.before) {
    yield opts.before();
  }

  let timePassed = 0;

  let i = 0;
  while (i < opts.iterations || timePassed < opts.minTime) {
    // get the current time difference
    let currentElapsed = process.hrtime(this.timer._marks[0].time);
    timePassed = currentElapsed[0] * 1e9 + currentElapsed[1];
    timePassed /= 1e6;

    let yieldArray = [];
    let j = 0;

    while (j < opts.concurrency && i + j < opts.iterations) {
      yieldArray.push(this.execute());
      j++;
    }

    yield yieldArray;

    i += opts.concurrency;
  }

  if (opts.after) {
    yield opts.after();
  }

  this.suite.currentObject = previous;
  yield this.timer.stop();

  yield this.calculateData();
};

/**
 * Executes a single concurrent run of the benchmark
 */
Bench.prototype.execute = function execute() {
  let fn = this.fn;
  let opts = this.opts;
  let runs = this.runs;

  return gen.run(function * executeBench() {
    if (opts.delay) {
      yield gen.delay(opts.delay);
    }

    let timer = new Timer();

    if (opts.beforeEach) {
      yield opts.beforeEach();
    }

    timer.start();

    yield gen.run(function * () {
      yield fn(timer);
    })().timeout(opts.timeOut).then(function(result) {
      timer.stop();
      runs.push(timer);
    }, function (e) {
      runs.push({error: e});
    });

    if (opts.afterEach) {
      yield opts.afterEach();
    }
  })();
};

Bench.prototype.calculateData = function calculateData() {
  this.totalRuns = this.runs.length;

  let start = yield this.timer.toNano(this.timer._marks[0].time);
  let stop = yield this.timer.toNano(suite.timer._marks[marksLength - 1].time);
  this.elapsed = stop - start;

  this.minOps = this.opts.minOps;

  yield this.calculateRuns();

  this.success = null;
  if (this.minOps) {
    data.success = true;
    if (this.ops < bench.minOps) {
      data.success = false;
    }
  }

  delete this.suite;
  delete this.fn;
  delete this.timer;
  delete this.runs;
  delete this.opts;
};

Bench.prototype.calculateRuns = function calculateRuns() {
  let times = [];
  let length = this.runs.length;
  let errorCount = 0;

  this.runs.forEach(function(run) {
    if (!run.error) {
      let start = timer.toNano(time._marks[0].time);
      let stop = yield timer.toNano(time._marks[time._marks.length - 1].time);
      let executionTime = stop - start;

      times.push(executionTime);
    } else {
      errorCount++;
    }
  });

  let stats = new Stats().push(times);
  stats = stats.iqr();

  this.mean = stats.amean();
  this.median = stats.median();
  let range = stats.range();
  this.min = range[0];
  this.max = range[1];
  this.stddev = stats.stddev();
  this.moe = stats.moe();

  this.ops = 1e9 / this.mean;
  this.opsMoe = (1e9 / (this.mean - this.moe)) - this.ops;

  this.errorCount = errorCount;
  this.errorRate = (errorCount / length);
  this.errorRate = this.errorRate.toFixed(2);
};

module.exports = Bench;
