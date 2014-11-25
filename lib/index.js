'use strict';

let loader = require('./loader');

/**
 * Sets up a new benchmark test runner
 *
 * @param {Object} conf - The default options for suites/benches
 */
function benchmark(conf) {
  let opts = {};
  opts.path = conf.path || 'benchmarks';
  opts.delay = conf.delay || 0;
  opts.iterations = conf.iterations || 10000;
  opts.reporter = conf.reporter || 'clean';
  opts.silent = conf.silent || false;
  opts.cli = conf.cli || false;
  opts.concurrency = conf.concurrency || 100;
  opts.minTime = conf.minTime || 1000;
  opts.timeOut = conf.timeOut || 1000;

  opts.iterations = parseInt(opts.iterations);
  opts.concurrency = parseInt(opts.concurrency);
  opts.delay = parseInt(opts.delay);

  opts.minTime = parseInt(opts.minTime);
  opts.timeOut = parseInt(opts.timeOut);

  loader(opts);
}

module.exports = benchmark;
