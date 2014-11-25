'use strict';

var chalk = require('chalk');
var check = '✓';
var err = '✖';
//var dot = '․';

if (process.platform === 'win32') {
  check = '\u221A';
  err = '\u00D7';
  //  dot = '.';
}

function Clean() {
  this.level = 0;
}

Clean.prototype.startSuite = function() {
  this.level += 2;
};

Clean.prototype.outputSuiteTitle = function(suite) {

};

Clean.prototype.outputSuiteRuntime = function(suite) {

};

Clean.prototype.endSuite = function() {
  this.level -= 2;
};

module.exports = Clean;
