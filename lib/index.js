'use strict';

var loader = require('./loader');

function benchmark(conf) {
  var opts = {};
  opts.path = conf.path || 'benchmarks';
  opts.delay = conf.delay || 100;
  opts.iterations = conf.iterations || 1000;
  opts.concurrency = conf.concurrency || 1;
  opts.mintime = conf.mintime || 10000;
  opts.timeout = conf.timeout || 2000;
  opts.reporter = conf.reporter || 'clean';
  opts.silent = conf.silent || false;
  opts.cli = conf.cli || false;

  loader(opts);
}

module.exports = benchmark;
