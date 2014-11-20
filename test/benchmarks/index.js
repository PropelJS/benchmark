'use strict';

/* globals suite:false, bench:false */
var gen = require('gen');

suite('main', function * main () {
  bench('bench', function * innerBench() {
    return true;
  });
});
