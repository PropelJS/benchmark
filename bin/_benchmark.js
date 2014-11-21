#!/usr/bin/env node

'use strict';

var benchmark = require('../lib/index');

var cli = require('nomnom');
cli.script('benchmark');

cli.option('version', {
  abbr: 'v',
  flag: true,
  help: 'Prints version information and exits',
  callback: version
});
cli.option('silent', {
  abbr: 's',
  flag: true,
  help: 'Suppresses the output'
});
cli.option('delay', {
  abbr: 'd',
  help: 'Default delay between each iteration in ms.',
  default: 100
});
cli.option('iterations', {
  abbr: 'i',
  help: 'Default iterations of each bench to run',
  default: 1000
});
cli.option('reporter', {
  abbr: 'r',
  help: 'The reporter to use',
  choices: ['clean', 'plain', 'json'],
  default: 'clean'
});
cli.option('path', {
  help: 'The directory or file to run',
  default: 'benchmarks',
  position: 0,
  type: 'string'
});

var opts = cli.parse();
opts.cli = true;

function version() {
  return 'v1.0.0';
}

benchmark(opts);
