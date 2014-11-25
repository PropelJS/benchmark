'use strict';

var gen = require('gen');

/* globals suite:false, bench:false */
suite('main', function * main () {
  suite('nested', function * nested () {
    bench('delay', function * delayed () {
      yield gen.delay(100);
    });
  }, {
    minOps: 1000
  });
  bench('bench', function * innerBench (timer) {
    timer.mark('ok');
    return true;
  });
}, {
  comp: 'bench',
  minOps: 1,
//  iterations: 1000000,
//  concurrency: 100000
});
suite('error', function * errorSuite () {
  bench('error', function * errorBench() {
    return 'ok';
  }, {
    minOps: 1e9
  });
}, {
  comp: 'any',
//  iterations: 1000000,
//  concurrency: 100000
});

