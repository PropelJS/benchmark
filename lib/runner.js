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
};

Runner.prototype.suite = function suite(name, fn, opts) {
  this.currentSuite.addSuite(name, fn, opts);
};

Runner.prototype.bench = function bench(name, fn, opts) {
  this.currentSuite.addBench(name, fn, opts);
};

Runner.prototype.loadFiles = function * loadFiles(file) {
  require(file);
};

Runner.prototype.run = function * run() {
  yield this.root.run();
};

Runner.prototype.results = function * results() {
  //console.log('Results would be returned here in JSON format');
};

module.exports = Runner;
