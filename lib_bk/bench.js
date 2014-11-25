'use strict';

Bench.prototype.getResults = function * getResults() {
  var results = {
    name: this.name,
    timer: this.timer,
    runs: this.runs,
    minOps: this.opts.minOps
  };

  return results;
};
