'use strict';

/* globals suite:false, bench:false, set:false */

suite('main', function * main () {
  bench('bench', function * innerBench() {
    console.log('bench');
  }, {
    before: beforeBench,
    after: afterBench
  });
  bench('second', function * second() {
    console.log('second bench');
  });
  suite('nested', function * nested() {
    bench('nestedBench', function * nestedBench() {
      console.log('nested bench');
    });
  }, {
    beforeEach: function * () {
      console.log('beforeEach nested')
    },
    afterEach: function * () {
      console.log('afterEach nested')
    }
  });
}, {
  before: beforeMain,
  after: afterMain,
  beforeEach: beforeEach,
  afterEach: afterEach
});

function * beforeMain() {
  console.log('before main');
}

function * afterMain() {
  console.log('after main');
}

function * beforeEach() {
  console.log('before each');
}

function * afterEach() {
  console.log('after each');
}

function * beforeBench() {
  console.log('before bench');
}

function * afterBench() {
  console.log('after bench');
}
