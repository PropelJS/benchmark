'use strict';

var gen = require('gen');

/* globals suite:false, bench:false */
suite('main', function * main () {
  suite('nested', function * nested () {
    bench('delay', function * delayed () {
      gen.delay(100);
    });
  });
  bench('bench', function * innerBench (timer) {
    timer.mark('ok');
    return true;
  });
}, {
  comp: 'bench'
});
suite('error', function * errorSuite () {
  bench('error', function * errorBench() {
    return 'ok';
  }, {
    minOps: 1e9
  });
}, {
  comp: 'any'
});
