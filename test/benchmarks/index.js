'use strict';

let gen = require('gen');

/* globals suite:false, bench:false */
suite('main', function * main () {
  suite('nested', function * nested () {
    bench('delay', function * delayed (timer) {
      yield gen.delay(100);
      timer.mark('ok');
      timer.mark('two');
      timer.mark('three');
      timer.mark('four');
      timer.mark('last');
    });
  });

  bench('bench', function * innerBench (timer) {
    timer.mark('ok');
    timer.mark('two');
    timer.mark('three');
    timer.mark('four');
    timer.mark('last');
  });
}, {
  comp: 'bench'
});

suite('error', function * errorSuite () {
  bench('error', function * errorBench() {
    return true;
  });
}, {
  comp: 'any'
});
