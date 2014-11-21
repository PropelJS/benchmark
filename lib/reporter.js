'use strict';

/**
 * Returns the appropriate reporter interface to output the results
 *
 * @param {Object} opts - The options for the reporter
 * @constructor
 */
function Reporter(reporter) {
  try {
    var Rep = require('../reporters/' + reporter);
    this.reporter = new Rep();
  } catch (e) {
    throw new Error('Invalid reporter');
  }
}

/**
 * Outputs the formatted results
 */
Reporter.prototype.output = function * output(results) {
  yield this.reporter.output(results);
};

module.exports = Reporter;
