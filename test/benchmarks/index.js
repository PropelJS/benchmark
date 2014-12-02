'use strict';

/* globals suite:false, bench:false */
suite('main', function * main () {
  suite('nested', function * nested () {
    bench('delay', function * delayed (timer) {
      timer.mark('ok');
    });
  });

  bench('bench', function * innerBench (timer) {
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
