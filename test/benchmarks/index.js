'use strict';

/* globals suite:false, bench:false */
suite('main', function * main () {
  bench('bench', function * innerBench (timer) {
    timer.mark('ok');
    return true;
  });
});
