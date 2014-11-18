'use strict';

var Suite = require('./suite');

function Runner(opts) {
  this.root = new Suite(this);
  this.suites = {};
  this.opts = opts;
  this.currentSuite = this.root;
}

Runner.prototype.setup = function setup() {
  global.suite = this.suite.bind(this);
  global.bench = this.bench.bind(this);
  global.before = this.before.bind(this);
  global.after = this.after.bind(this);
  global.beforeEach = this.beforeEach.bind(this);
  global.afterEach = this.afterEach.bind(this);
};

Runner.prototype.suite = function suite(name, fn, opts) {
  this.currentSuite.addSuite(name, fn, opts);
};

Runner.prototype.bench = function bench(name, fn, opts) {
  this.currentSuite.addBench(name, fn, opts);
};

Runner.prototype.before = function before(fn) {
  this.currentSuite.before(fn);
};

Runner.prototype.after = function after(fn) {
  this.currentSuite.after(fn);
};

Runner.prototype.beforeEach = function beforeEach(fn) {
  this.currentSuite.beforeEach(fn);
};

Runner.prototype.afterEach = function afterEach(fn) {
  this.currentSuite.afterEach(fn);
};

Runner.prototype.loadFiles = function * loadFiles(file) {
  require(file);
};

Runner.prototype.run = function * run() {
  yield this.root.run();
};

Runner.prototype.results = function * results() {
  console.log('Results would be returned here in JSON format');
};

module.exports = Runner;
