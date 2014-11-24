'use strict';

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
  this.timer = new Timer();
}

/**
 * Runs this suite and all of it's child suites/benchmarks
 */
Suite.prototype.run = function * run() {
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
