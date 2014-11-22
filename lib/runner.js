'use strict';

var Suite = require('./suite');
var Timer = require('Timer');
var Stats = require('fast-stats').Stats;

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
  var marksLength = yield suite.timing._marks.length;
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

  // need to determine error or success here
  data.success = null;
  if (suite.comp) {
    this.calculateComp(data, suite.comp);
    data.success = false;
    if (data.fastest === suite.comp) {
      data.success = true;
    }
  }

  return data;
};

Runner.prototype.calculateComp = function calculateComp(data, comp) {
  var benches = data.benches;

  var fastest = null;
  var fastestOps = 0;

  var slowest = null;
  var slowestOps = Infinity;

  var toCompare = null;

  benches.forEach(function(bench) {
    if (bench.ops > fastestOps) {
      fastest = bench.name;
      fastestOps = bench.ops;
    }

    if (bench.ops < slowestOps) {
      slowest = bench.name;
      slowestOps = bench.ops;
    }

    if (bench.name === 'comp') {
      toCompare = bench.ops;
    }
  });

  if (toCompare) {
    benches.forEach(function(bench) {
      bench.percentOps = (bench.ops / toCompare) / 100;
    });
  }

  data.slowest = slowest;
  data.slowestOps = slowestOps;
  data.fastest = fastest;
  data.fastestOps = fastestOps;

  benches = null;
};

Runner.prototype.calculateBench = function * calculateBench(bench) {
  var data = {};
  var timer = new Timer();

  var marksLength = bench.timer._marks.length;
  var start = yield timer.toNano(bench.timer._marks[0].time);
  var stop = yield timer.toNano(bench.timer._marks[marksLength - 1].time);

  data.name = bench.name;
  data.elapsed = stop - start;
  data.totalRuns = bench.runs.length;

  yield this.calculateRuns(bench.runs, data);

  data.success = null;

  if (bench.minOps) {
    data.success = true;
    if (data.ops < bench.minOps) {
      data.success = false;
    }
  }

  data.marks = yield this.calculateMarks(bench.runs);

  return data;
};

Runner.prototype.calculateMarks = function * calculateMarks(runs) {
  var timer = new Timer();
  var obj = {};

  var times = {};

  runs.forEach(function(run) {
    var marks = run._marks;
    var start = marks.shift();

    marks.forEach(function(mark) {
      var startTime = timer.toNano(start.time);
      var endTime = timer.toNano(mark.time);
      start = mark;

      if (!times[mark.name]) {
        times[mark.name] = [];
      }

      times[mark.name].push(endTime - startTime);
    });
  });

  var keys = Object.keys(times);
  var _this = this;
  keys.forEach(function(key) {
    var stats = {};
    _this.getStats(times[key], stats);
    obj[key] = stats;
  });

  times = null;

  return obj;
};

Runner.prototype.calculateRuns = function * calculateRuns(runs, data) {
  var timer = new Timer();
  var times = [];
  var length = runs.length;
  var errorCount = 0;
  var totalTime = 0;

  var i = 0;

  while (i < length) {
    var time = runs[i];
    if (!time.error) {
      var start = yield timer.toNano(time._marks[0].time);
      var stop = yield timer.toNano(time._marks[time._marks.length - 1].time);
      var executionTime = stop - start;

      times.push(executionTime);
      totalTime += executionTime;
      i++;
    } else {
      errorCount++;
    }
  }

  this.getStats(times, data);

  data.errorCount = errorCount;
  data.errorRate = (errorCount / length);
  data.errorRate = data.errorRate.toFixed(2);

  times = null;
};

Runner.prototype.getStats = function getStats(vals, obj) {
  var stats = new Stats().push(vals);
  stats = stats.iqr();

  obj.mean = stats.amean();
  obj.firstQuarter = stats.percentile(25);
  obj.thirdQuarter = stats.percentile(75);
  obj.median = stats.median();
  var range = stats.range();
  obj.min = range[0];
  obj.max = range[1];
  obj.stddev = stats.stddev();
  obj.moe = stats.moe();

  obj.ops = 1e9 / obj.mean;
  obj.opsMoe = (1e9 / (obj.mean - obj.moe)) - obj.ops;

  stats = null;
};

module.exports = Runner;
