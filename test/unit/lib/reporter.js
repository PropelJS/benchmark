'use strict';

/* globals describe: false, it: false */

require('should');
require('co-mocha');

let Reporter = require('../../../lib/reporter');

describe('reporter', function() {
  it('should return an object', function * () {
    let reporter = new Reporter('clean');
    reporter.should.be.type('object');
  });

  it('should handle npm reporters', function * () {
    let reporter = new Reporter('Timer');
    reporter.should.be.type('object');
  });

  it('should error on invalid reporters', function * () {
    try {
      let reporter = new Reporter('xyz');
      reporter.should.be.type('object');
    } catch (err) {
      err.should.be.type('object');
    }
  });
});
