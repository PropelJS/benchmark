'use strict';

/* globals describe: false, it: false */

require('should');
require('co-mocha');

let loader = require('../../../lib/loader');
let path = require('path');

describe('loader', function() {
  it('should return a function', function * () {
    loader.should.be.type('function');
  });

  it('should handle directories', function * (done) {
    yield loader({
      path: path.resolve(__dirname, '../../benchmarks'),
      reporter: 'clean'
    }).then(function(result) {
      result.should.be.type('object');
      done();
    }, function(err) {
      throw err;
    });
  });

  it('should handle single files', function * (done) {
    yield loader({
      path: path.resolve(__dirname, '../../benchmarks/index.js'),
      reporter: 'clean'
    }).then(function(result) {
      result.should.be.type('object');
      done();
    }, function(err) {
      throw err;
    });
  });

  // it should throw an error if no files are found
  it('should throw an error if no files are found', function * (done) {
    yield loader({
      path: path.resolve(__dirname, '../../empty'),
      reporter: 'clean'
    }).then(function(result) {
      throw new Error('It should not make it here');
    }, function(error) {
      error.should.be.type('object');
      done();
    });
  });
});
