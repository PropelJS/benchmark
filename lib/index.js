'use strict';

var loader = require('./loader');

/**
 * Sets up a new benchmark test runner
 *
 * @param {Object} conf - The default options for suites/benches
 */
function benchmark(conf) {
  var opts = {};
  opts.path = conf.path || 'benchmarks';
  opts.delay = conf.delay || 100;
  opts.iterations = conf.iterations || 1000;
  opts.reporter = conf.reporter || 'clean';
  opts.silent = conf.silent || false;
  opts.cli = conf.cli || false;
  opts.concurrency = conf.concurrency || 1;

  opts.iterations = parseInt(opts.iterations);
  opts.concurrency = parseInt(opts.concurrency);
  opts.delay = parseInt(opts.delay);

  loader(opts);
}

module.exports = benchmark;
