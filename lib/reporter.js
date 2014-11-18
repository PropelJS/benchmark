'use strict';

function Reporter(opts) {

}

Reporter.prototype.output = function * output() {
  console.log('output would go here');
};

module.exports = Reporter;
