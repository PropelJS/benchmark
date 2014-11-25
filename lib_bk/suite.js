'use strict';



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
