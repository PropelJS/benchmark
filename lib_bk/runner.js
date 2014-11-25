'use strict';

Runner.prototype.calculateSuite = function * calculateSuite(suite) {
  var data = {};
  var timer = new Timer();
  var marksLength = yield suite.timing._marks.length;

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
  data.marks = yield this.calculateMarks(bench.runs);
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

module.exports = Runner;
