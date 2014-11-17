'use strict';

function Runner(opts) {
  this.suites = {};
  this.stats = {suites: 0, benches: 0};
  this.timer = {};//require the timer here
  this.reporter = {};//require the reporter here
}

Runner.prototype.setup = function setup() {
  global.suite = this.suite.bind(this);
  global.bench = this.bench.bind(this);
  global.set = this.set.bind(this);
  global.before = this.before.bind(this);
  global.after = this.after.bind(this);
  global.beforeEach = this.beforeEach.bind(this);
  global.afterEach = this.afterEach.bind(this);
};

Runner.prototype.suite = function suite(name, fn) {
  console.log('Starts a new suite');
};

Runner.prototype.bench = function bench() {
  console.log('Starts a new bench');
};

Runner.prototype.set = function set() {
  console.log('Sets the options on the current suite or bench');
};

Runner.prototype.before = function before() {
  console.log('Sets a function to run before the suite or bench starts');
};

Runner.prototype.after = function after() {
  console.log('Sets a function to run after the suite or bench finishes');
};

Runner.prototype.beforeEach = function beforeEach() {
  console.log('Sets a function to run before each bench in a suite');
};

Runner.prototype.afterEach = function afterEach() {
  console.log('Sets a function to run after each bench in a suite');
};

module.exports = Runner;
