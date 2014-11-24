'use strict';

let Bench = require('./bench');
let extend = require('util')._extend;
let Timer = require('Timer');

function Suite(parent, name, fn, opts) {
  this.children = [];
  this.benches = [];
  this.parent = parent;
  this.name = name;
  this.fn = fn;
  this.currentObject = this;
  this.beforeEach = [];
  this.afterEach = [];
  this.reporter = parent.reporter;
  this.opts = parent.opts;
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
  this.opts = extend(opts, parent.opts);
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

Suite.prototype.run = function * run(runner) {
  runner.currentSuite = this;

  yield this.setupBeforeEach();
  yield this.setupAfterEach();

  console.log(this);
};

/**
 * Ensures that any parent beforeEach methods are also applied to this suite
 */
Suite.prototype.setupBeforeEach = function setupBeforeEach() {
  let parent = this.parent;

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
 */
Suite.prototype.setupAfterEach = function setupAfterEach() {
  let parent = this.parent;

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

module.exports = Suite;
