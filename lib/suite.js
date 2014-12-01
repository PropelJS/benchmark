'use strict';

let Bench = require('./bench');
let extend = require('util')._extend;
let Timer = require('Timer');

/**
 * Creates a new suite
 *
 * @param {Object} parent - The suites parent
 * @param {String} name - The name of the suite
 * @param {Function} fn - The suite function
 * @param {Object} opts - The options for the suite
 * @constructor
 */
function Suite(parent, name, fn, opts) {
  this.children = [];
  this.benches = [];
  this.parent = parent;
  this.name = name;
  this.fn = fn;
  this.currentObject = this;
  this.beforeEach = [];
  this.afterEach = [];
  this.timer = new Timer();
  if (!opts) {
    opts = {};
  }
  if (!opts.comp) {
    opts.comp = false;
  }
  if (!opts.before) {
    opts.before = false;
  }
  if (!opts.beforeEach) {
    opts.beforeEach = false;
  }
  if (!opts.after) {
    opts.after = false;
  }
  if (!opts.afterEach) {
    opts.afterEach = false;
  }
  let parentOpts = extend({}, parent.opts);
  this.opts = extend(parentOpts, opts);
  this.setupBeforeEach();
  this.setupAfterEach();
}

/**
 * Adds a new suite as a child of the current suite
 *
 * @param {String} name - The name of the suite to create
 * @param {Function} suite - The function for the suite
 * @param {Object} opts - Options for the suite
 */
Suite.prototype.addSuite = function addSuite(name, suite, opts) {
  let child = new Suite(this, name, suite, opts);
  this.children.push(child);
};

/**
 * Adds a benchmark to the current suite
 *
 * @param {String} name - The name of the benchmark to add
 * @param {Function} bench - The benchmark function
 * @param {Object} opts - Options for the benchmark
 */
Suite.prototype.addBench = function addBench(name, bench, opts) {
  if (this.currentObject === this) {
    let benchmark = new Bench(this, name, bench, opts);
    this.benches.push(benchmark);
  } else {
    this.currentObject.addBench(name, bench, opts);
  }
};

/**
 * Runs this suite and all of it's child suites/benchmarks
 *
 * @param {Object} runner - the runner that is executing this suite
 */
Suite.prototype.run = function * run(runner) {
  let previous = runner.currentSuite;
  runner.currentSuite = this;

  yield this.timer.start();

  if (this.opts.before) {
    yield this.opts.before();
  }

  if (this.fn) {
    yield this.fn();
  }

  yield this.handleBenches();
  yield this.handleSuites(runner);

  if (this.opts.after) {
    yield this.opts.after();
  }

  yield this.timer.stop();

  yield this.calculateData();

  runner.currentSuite = previous;
};

/**
 * Runs this suites child suites
 */
Suite.prototype.handleSuites = function * handleSuites(runner) {
  let length = this.children.length;
  let i = 0;
  while (i < length) {
    let child = this.children[i];
    let previous = this.currentObject;
    this.currentObject = child;
    yield child.run(runner);
    this.currentObject = previous;
    i++;
  }
};

/**
 * Runs this suites benchmarks
 */
Suite.prototype.handleBenches = function * handleBenches() {
  let length = this.benches.length;
  let i = 0;
  while (i < length) {
    let bench = this.benches[i];
    yield this.beforeEach;
    yield bench.run();
    yield this.afterEach;
    i++;
  }
};

/**
 * Ensures that any parent beforeEach methods are also applied to this suite
 */
Suite.prototype.setupBeforeEach = function setupBeforeEach() {
  let parent = this.parent;

  if (parent.beforeEach) {
    let _this = this;
    // add any items in the parent to this.beforeEach
    parent.beforeEach.forEach(function(fn) {
      _this.beforeEach.push(fn);
    });
  }

  if (this.opts.beforeEach) {
    this.beforeEach.push(this.opts.beforeEach);
  }
};

/**
 * Ensures that any parent afterEach methods are also applied to this suite
 */
Suite.prototype.setupAfterEach = function setupAfterEach() {
  let parent = this.parent;

  if (this.opts.afterEach) {
    this.afterEach.push(this.opts.afterEach);
  }

  if (parent.afterEach) {
    let _this = this;

    parent.afterEach.forEach(function(fn) {
      _this.afterEach.push(fn);
    });
  }
};

Suite.prototype.calculateData = function calculateData() {
  let marksLength = this.timer._marks.length;
  this.elapsed = 0;
  this.success = null;
  this.comp = this.opts.comp;

  if (this.comp) {
    this.calculateComp();

    this.success = this.fastest === this.comp;
  }

  // get the elapsed here
  let start = this.timer.toNano(this.timer._marks[0].time);
  let stop = this.timer.toNano(this.timer._marks[marksLength - 1].time);
  this.elapsed = stop - start;

  delete this.parent;
  delete this.fn;
  delete this.currentObject;
  delete this.beforeEach;
  delete this.afterEach;
  delete this.before;
  delete this.after;
  delete this.opts;
  delete this.timer;
};

Suite.prototype.calculateComp = function calculateComp() {
  let benches = this.benches;
  let _this = this;

  let fastest = null;
  let fastestOps = 0;

  let slowest = null;
  let slowestOps = Infinity;

  let toCompare = null;

  benches.forEach(function(bench) {
    if (bench.ops > fastestOps) {
      fastest = bench.name;
      fastestOps = bench.ops;
    }

    if (bench.ops < slowestOps) {
      slowest = bench.name;
      slowestOps = bench.ops;
    }

    if (bench.name === _this.comp) {
      toCompare = bench.ops;
      bench.comp = _this.comp;
    }
  });

  benches.forEach(function(bench) {
    bench.percentOps = (bench.ops / toCompare);
  });

  this.slowest = slowest;
  this.slowestOps = slowestOps;
  this.fastest = fastest;
  this.fastestOps = fastestOps;
};

module.exports = Suite;
