'use strict';

var Bench = require('./bench');
var extend = require('util')._extend;
var Timer = require('Timer');

/**
 * Creates a new suite
 *
 * @param {Object} runner - The runner executing the suite
 * @param {String} name - The name of the suite
 * @param {Function} fn - The suite function
 * @param {Object} opts - The options for the suite
 * @constructor
 */
function Suite(runner, name, fn, opts) {
  if (!opts) {
    opts = {};
  }
  this.children = [];
  this.benches = [];
  this.name = name || '';
  this.runner = runner;
  this.fn = fn;
  this.timer = new Timer();
  this.currentObject = this;
  this.opts = extend({}, runner.opts);
  this.overrides = opts;
  this.beforeEach = [];
  this.afterEach = [];
}

/**
 * Adds a new suite as a child of the current suite
 *
 * @param {String} name - The name of the suite to create
 * @param {Function} suite - The function for the suite
 * @param {Object} opts - Options for the suite
 */
Suite.prototype.addSuite = function addSuite(name, suite, opts) {
  var child = new Suite(this.runner, name, suite, opts);
  this.children.push(child);
};

/**
 * Runs this suite and all of it's child suites/benchmarks
 */
Suite.prototype.run = function * run() {
  var parent = this.runner.currentSuite;
  this.opts = extend(this.opts, parent.opts);

  if (!this.overrides.comp) {
    this.overrides.comp = false;
  }

  this.opts = extend(this.opts, this.overrides);
  this.runner.currentSuite = this;

  yield this.setupBeforeEach(parent);
  yield this.setupAfterEach(parent);

  yield this.timer.start();

  if (this.opts.before) {
    yield this.opts.before();
  }

  if (this.fn) {
    yield this.fn();
  }

  yield this.handleBenches();
  yield this.handleSuites();

  if (this.opts.after) {
    yield this.opts.after();
  }

  yield this.timer.stop();

  this.runner.currentSuite = parent;
};

/**
 * Ensures that any parent beforeEach methods are also applied to this suite
 *
 * @param {Object} parent - The parent of this suite
 */
Suite.prototype.setupBeforeEach = function * setBeforeEach(parent) {
  if (parent.beforeEach) {
    var _this = this;
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
 *
 * @param {Object} parent - The parent of this suite
 */
Suite.prototype.setupAfterEach = function * setupAfterEach(parent) {
  if (this.opts.afterEach) {
    this.afterEach.push(this.opts.afterEach);
  }

  if (parent.afterEach) {
    var _this = this;

    parent.afterEach.forEach(function(fn) {
      _this.afterEach.push(fn);
    });
  }
};

/**
 * Runs this suites child suites
 */
Suite.prototype.handleSuites = function * handleSuites() {
  var length = this.children.length;
  var i = 0;
  while (i < length) {
    var child = this.children[i];
    var previous = this.currentObject;
    this.currentObject = child;
    yield child.run();
    this.currentObject = previous;
    i++;
  }
};

/**
 * Runs this suites benchmarks
 */
Suite.prototype.handleBenches = function * handleBenches() {
  var length = this.benches.length;
  var i = 0;
  while (i < length) {
    var bench = this.benches[i];
    yield bench.run();
    i++;
  }
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
    var benchmark = new Bench(this, name, bench, opts);
    this.benches.push(benchmark);
  } else {
    this.currentObject.addBench(name, bench, opts);
  }
};

/**
 *  Returns the result sets from this and all child suite/benches
 */
Suite.prototype.getResults = function * getResults() {
  var results = {
    name: this.name,
    timing: this.timer,
    comp: this.opts.comp
  };

  if (this.benches.length) {
    results.benches = [];

    var i = 0;

    while (i < this.benches.length) {
      var benchResults = yield this.benches[i].getResults();
      results.benches.push(benchResults);
      i++;
    }
  }

  if (this.children.length) {
    results.suites = [];

    var j = 0;

    while (j < this.children.length) {
      var childResults = yield this.children[j].getResults();
      results.suites.push(childResults);
      j++;
    }
  }

  return results;
};

module.exports = Suite;
