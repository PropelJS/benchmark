'use strict';

var extend = require('util')._extend;

function Bench(suite, name, fn, opts) {
  if(!opts) {
    opts = {};
  }
  this.suite = suite;
  this.name = name;
  this.fn = fn;
  this.opts = extend({}, this.suite.opts);
  this.overrides = opts;
}

Bench.prototype.run = function * run() {
  this.opts = extend(this.opts, this.overrides);

  var parent = this.suite.currentObject;
  this.suite.currentObject = this;

  if(this.fn) {
    yield this.execute();
  }

  this.suite.currentObject = parent;
};

Bench.prototype.execute = function * execute() {
  var fn = this.fn;
  var opts = this.opts;
  console.log(opts);

  yield fn();
};

Bench.prototype.set = function set(name, value) {
  this.opts[name] = value;
};

module.exports = Bench;
