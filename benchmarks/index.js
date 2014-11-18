'use strict';

/* globals suite:false, bench:false, set:false */

suite('main', function * main () {
  bench('before', function * before() {
    console.log('before bench');
  });
  suite('inner', function * inner() {
    console.log('ok');
    bench('inner bench', function * innerBench() {
      console.log('inner bench');
    });
    bench('second inner bench', function * secondInnerBench() {
      console.log('second inner bench');
    }, {
      delay: 1000
    });
  }, {
    delay: 200
  });
  bench('after', function * after() {
    console.log('after bench');
  });
});

suite('second', function * second () {
  console.log('in second');
});
