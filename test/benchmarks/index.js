'use strict';

var gen = require('gen');

/* globals suite:false, bench:false */
suite('main', function * main () {
  suite('nested', function * nested () {
    bench('delay', function * delayed (timer) {
      yield gen.delay(100);
      timer.mark('ok');
      timer.mark('two');
      timer.mark('3');
      timer.mark('four');
      timer.mark('last');
    });
  }, {
    minOps: 1000
  });
  bench('bench', function * innerBench (timer) {
    timer.mark('ok');
    timer.mark('two');
    timer.mark('3');
    timer.mark('four');
    timer.mark('last');
  });
}, {
  comp: 'bench',
  minOps: 1
});
suite('error', function * errorSuite () {
  bench('error', function * errorBench(timer) {
    return true;
  }, {
    minOps: 1e9
  });
}, {
  comp: 'any'
});

