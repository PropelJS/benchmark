'use strict';

let extend = require('util')._extend;
let gen = require('gen');
let Timer = require('Timer');
let Stats = require('fast-stats').Stats;

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
  this.runs = [];
  this.marks = {};
  this.markData = {};

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

  this.timer.start();

  let previous = this.suite.currentObject;
  this.suite.currentObject = this;

  if (!this.fn) {
    this.suite.currentObject = parent;
    this.timer.stop();
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

    while ((j < opts.concurrency)) {
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
  this.timer.stop();

  this.calculateData();
};

/**
 * Executes a single concurrent run of the benchmark
 */
Bench.prototype.execute = function execute() {
  let fn = this.fn;
  let opts = this.opts;
  let runs = this.runs;
  let _this = this;

  return gen.run(function * executeBench() {
    if (opts.delay) {
      yield gen.delay(opts.delay);
    }

    let timer = new Timer();

    if (opts.beforeEach) {
      yield opts.beforeEach();
    }

    yield gen.run(function * () {
      timer.start();
      let res = yield * fn(timer);
      timer.stop();
      return res;
    })().timeout(opts.timeOut).then(function() {
      runs.push(_this.calculateTimer(timer));
    }, function (e) {
      runs.push({error: e});
    });

    if (opts.afterEach) {
      yield opts.afterEach();
    }
  })();
};

Bench.prototype.calculateTimer = function calculateTimer(timer) {
  let obj = this.marks;
  let marksLength = timer._marks.length;

  let start = timer.toNano(timer._marks[0].time);
  let stop = timer.toNano(timer._marks[marksLength - 1].time);
  let executionTime = stop - start;

  let marks = timer._marks;
  let startMark = marks.shift();

  marks.forEach(function(mark) {
    let startTime = timer.toNano(startMark.time);
    let endTime = timer.toNano(mark.time);
    startMark = mark;

    if (!obj[mark.name]) {
      obj[mark.name] = [];
    }

    obj[mark.name].push(endTime - startTime);
  });

  return executionTime;
};

Bench.prototype.calculateData = function calculateData() {
  this.totalRuns = this.runs.length;

  let marksLength = this.timer._marks.length;

  let start = this.timer.toNano(this.timer._marks[0].time);
  let stop = this.timer.toNano(this.timer._marks[marksLength - 1].time);
  this.elapsed = stop - start;

  this.minOps = this.opts.minOps;

  this.calculateRuns();
  this.calculateMarks();

  this.success = null;
  if (this.minOps) {

    this.success = this.ops >= this.minOps;
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
      times.push(run);
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
  this.totalRuns = length;
};

Bench.prototype.calculateMarks = function calculateMarks() {
  let marks = this.marks;
  let keys = Object.keys(marks);
  let _this = this;

  keys.forEach(function(key) {
    let arr = marks[key];
    let res = {};

    let stats = new Stats().push(arr);
    stats = stats.iqr();

    res.mean = stats.amean();
    res.median = stats.median();
    let range = stats.range();
    res.min = range[0];
    res.max = range[1];
    res.moe = stats.moe();

    res.ops = 1e9 / res.mean;
    res.opsMoe = (1e9 / (res.mean - res.moe)) - res.ops;

    _this.markData[key] = res;
  });

  delete this.marks;
};

module.exports = Bench;
