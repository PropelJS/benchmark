'use strict';

/**
 * Returns the appropriate reporter interface to output the results
 *
 * @param {Object} opts - The options for the reporter
 * @constructor
 */
function Reporter(opts) {

}

/**
 * Outputs the formatted results
 */
Reporter.prototype.output = function * output() {
  console.log('output would go here');
};

module.exports = Reporter;
