'use strict';

var Bench = require('./bench');
var extend = require('util')._extend;

function Suite(runner, name, fn, opts) {
  if(!opts) {
    opts = {};
  }
  this.children = [];
  this.benches = [];
  this.name = name || '';
  this.runner = runner;
  this.fn = fn;
  this.currentObject = this;
  this.opts = extend({}, runner.opts);
  this.overrides = opts;
}

Suite.prototype.addSuite = function addSuite(name, suite, opts) {
  var child = new Suite(this.runner, name, suite, opts);
  this.children.push(child);
};

Suite.prototype.run = function * run() {
  this.opts = extend(this.opts, this.overrides);
  var parent = this.runner.currentSuite;
  this.runner.currentSuite = this;

  if(this.fn) {
    yield this.fn();
  }

  yield this.handleSuites();
  yield this.handleBenches();

  this.runner.currentSuite = parent;
};

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

Suite.prototype.handleBenches = function * handleBenches() {
  var length = this.benches.length;
  var i = 0;
  while (i < length) {
    var bench = this.benches[i];
    yield bench.run();
    i++;
  }
};

Suite.prototype.addBench = function addBench(name, bench, opts) {
  var benchmark = new Bench(this, name, bench, opts);
  this.benches.push(benchmark);
};

Suite.prototype.set = function set(name, value) {
  if(this.currentObject === this) {
    this.opts[name] = value;
  } else {
    this.currentObject.set(name, value);
  }
};

module.exports = Suite;
