'use strict';

var Suite = require('./suite');
var Timer = require('Timer');

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
  var res = yield this.root.getResults();

  res = yield this.calculateResults(res.suites);
  return res;
};

Runner.prototype.calculateResults = function * calculateResults(results) {
  var ret = [];

  var length = results.length;
  var i = 0;
  while (i < length) {
    var suiteResult = yield this.calculateSuite(results[i]);
    ret.push(suiteResult);
    i++;
  }

  return ret;
};

Runner.prototype.calculateSuite = function * calculateSuite(suite) {
  var data = {};
  var timer = new Timer();
  var marksLength = suite.timing._marks.length;
  var start = yield timer.toNano(suite.timing._marks[0].time);
  var stop = yield timer.toNano(suite.timing._marks[marksLength - 1].time);

  data.name = suite.name;
  data.elapsed = stop - start;

  if (suite.suites) {
    data.suites = yield this.calculateResults(suite.suites);
  }

  if (suite.benches) {
    data.benches = [];
    var length = suite.benches.length;
    var i = 0;
    while (i < length) {
      var benchResult = yield this.calculateBench(suite.benches[i]);
      data.benches.push(benchResult);
      i++;
    }
  }

  return data;
};

Runner.prototype.calculateBench = function * calculateBench(bench) {
  var data = {};
  var timer = new Timer();

  var marksLength = bench.timer._marks.length;
  var start = yield timer.toNano(bench.timer._marks[0].time);
  var stop = yield timer.toNano(bench.timer._marks[marksLength -1].time);

  data.name = bench.name;
  data.elapsed = stop - start;

  yield this.calculateRuns(bench.runs, data);

  console.log(data);

  return data;
};

Runner.prototype.calculateRuns = function * calculateRuns(runs, data) {
  var timer = new Timer();
  var times = [];
  var length = runs.length;
  var errorCount = 0;
  var totalTime = 0;

  var i = 0;

  while (i < length) {
    var timer = runs[i];
    if(!timer.error) {
      var start = yield timer.toNano(timer._marks[0].time);
      var stop = yield timer.toNano(timer._marks[timer._marks.length - 1].time);
      var executionTime = stop - start;

      times.push(executionTime);
      totalTime += executionTime;
      i++;
    } else {
      errorCount++;
    }
  }

  data.times = times;
  data.mean = totalTime / (length - errorCount);
  data.ops = 1000000000 / data.mean;
  data.mean = data.mean.toFixed(2);
  if (data.ops < 1000) {
    data.ops = data.ops.toFixed(2);
  } else {
    data.ops = Math.round(data.ops);
  }
};

module.exports = Runner;
