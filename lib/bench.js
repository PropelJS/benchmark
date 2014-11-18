'use strict';

var extend = require('util')._extend;
var gen = require('gen');

function Bench(suite, name, fn, opts) {
  if(!opts) {
    opts = {};
  }
  this.suite = suite;
  this.name = name;
  this.fn = fn;
  this.opts = extend({}, this.suite.opts);
  if(this.opts.before) {
    delete this.opts.before;
  }
  if(this.opts.after) {
    delete this.opts.after;
  }
  this.overrides = opts;
}

Bench.prototype.run = function * run() {
  this.opts = extend(this.opts, this.overrides);
  var opts = this.opts;

  var parent = this.suite.currentObject;
  this.suite.currentObject = this;

  if (this.fn) {
    var i = 1;
    while (i <= opts.iterations) {
      yield this.execute(this.fn, opts, this.suite);
      i += opts.concurrency;
    }
  }

  this.suite.currentObject = parent;
};

Bench.prototype.execute = function * execute(fn, opts, suite) {
  if (suite.beforeEach) {
    var i = 0;
    while (i < suite.beforeEach.length) {
      yield suite.beforeEach[i]();
      i++;
    }
  }

  if (opts.before) {
    yield opts.before();
  }

  yield gen.delay(opts.delay);
  yield fn();

  if (opts.after) {
    yield opts.after();
  }

  if (suite.afterEach) {
    var i = 0;
    while (i < suite.afterEach.length) {
      yield suite.afterEach[i]();
      i++;
    }
  }
};

Bench.prototype.set = function set(name, value) {
  this.opts[name] = value;
};

module.exports = Bench;
