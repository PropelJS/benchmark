'use strict';

/* globals describe: false, it: false */

require('should');
require('co-mocha');

let benchmark = require('../../../lib/index');
let path = require('path');

describe('benchmark', function() {
  it('should return a function', function * () {
    benchmark.should.be.type('function');
  });

  it('should return the results', function * (done) {
    yield benchmark({
      path: path.resolve(__dirname, '../../benchmarks'),
      iterations: 2,
      concurrency: 2,
      minTime: 1
    }).then(function(result) {
      result.should.be.type('object');
      done();
    }, function(error) {
      console.log(error);
    });
  });

  it('should have default options', function * (done) {
    yield benchmark().then(function(res) {
      throw new Error('Should not make it here');
    }, function(err) {
      done();
    });
  });
});
