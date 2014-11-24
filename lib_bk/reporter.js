'use strict';

/**
 * Returns the appropriate reporter interface to output the results
 *
 * @param {Object} reporter - The reporter to use
 * @constructor
 */
function Reporter(reporter) {
  try {
    var Rep = require('../reporters/' + reporter);
    return new Rep();
  } catch (e) {
    try {
      Rep = require(reporter);
      return new Rep();
    } catch (err) {
      throw new Error('Invalid reporter');
    }
  }
}
