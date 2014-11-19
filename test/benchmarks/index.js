'use strict';

/* globals suite:false, bench:false */
var gen = require('gen');

suite('main', function * main () {
  bench('bench', function * innerBench() {
    yield gen.delay(5000);
    console.log('bench');
  }, {
    concurrency: 1,
    delay: 0,
    iterations: 20,
    mintime: 1000,
    timeout: 2000
  });
});
