'use strict';

let chalk = require('chalk');
let check = '✓';
let err = '✖';

if (process.platform === 'win32') {
  check = '\u221A';
  err = '\u00D7';
}

/**
 * Creates a new clean reporter
 *
 * @constructor
 */
function Clean() {
}

/**
 * Handles the initial output logic for a suite
 *
 * @param {Suite} suite - the suite to output
 * @param {integer} level - the indentation level of the suite
 */
Clean.prototype.output = function output(suite, level) {
  if (!level) {
    level = 2;
  }

  let children = suite.children;
  let _this = this;
  if (children) {
    children.forEach(function(child) {
      _this.outputSuite(child, level);
    });
  }
};

/**
 * Outputs the data for an individual suite
 *
 * @param {Suite} suite - The suite to output data for
 * @param {Integer} level - The output padding level
 */
Clean.prototype.outputSuite = function outputSuite(suite, level) {
  let suiteTime = this.formatTime(suite.elapsed);

  let str = '';
  str += this.addPadding(level);
  let color = chalk.gray;

  if (suite.success === true) {
    str += check + ' ';
    color = chalk.green;
  }

  if (suite.success === false) {
    str += err + ' ';
    color = chalk.red;
  }

  str += 'Suite: ' + suite.name;
  console.log(color(str));

  this.outputData('Execution Time', suiteTime, level);

  if (suite.comp) {
    this.outputData('Fastest Was', suite.fastest + ' - ' + Math.round(suite.fastestOps) + ' ops/second', level);
    this.outputData('Slowest Was', suite.slowest + ' - ' + Math.round(suite.slowestOps) + ' ops/second', level);
  }

  let _this = this;
  suite.benches.forEach(function(bench) {
    _this.outputBench(bench, level + 2);
  });

  if (suite.children) {
    this.output(suite, level + 2);
  }
};

/**
 * Outputs the data for a bench
 *
 * @param {Bench} bench - The bench to output data for
 * @param {Integer} level - The output padding level
 */
Clean.prototype.outputBench = function outputBench(bench, level) {
  let str = this.addPadding(level);
  let color = chalk.gray;
  if (bench.success === true) {
    str += check + ' ';
    color = chalk.green;
  }
  if (bench.success === false) {
    str += err + ' ';
    color = chalk.red;
  }
  str += 'Bench: ' + bench.name;
  console.log(color(str));

  let opsVal = Math.round(bench.ops) + ' \u00B1 ' + Math.round(bench.opsMoe);
  this.outputData('Ops Per Second', opsVal, level);

  if (bench.comp) {
    this.handleBenchComp(bench, level);
  }

  this.outputData('Total Runs', bench.totalRuns, level);
  this.outputData('Average Execution Time', this.formatTime(bench.mean), level);
  this.outputData('Median Execution Time', this.formatTime(bench.median), level);
  this.outputData('Fastest Run', this.formatTime(bench.min), level);
  this.outputData('Slowest Run', this.formatTime(bench.max), level);
  this.outputData('Error Rate', bench.errorRate + '%', level);

  let moePercent = (bench.moe * 100 / bench.mean).toFixed(2);
  this.outputData('Margin of Error', moePercent + '%', level);

  this.outputData('Execution Time', this.formatTime(bench.elapsed), level);

  if (bench.markData) {
    this.outputMarks(bench.markData, level + 2);
  }
};

/**
 * Outputs the bench data relating to comparative suites
 *
 * @param {Bench} bench - the bench to output the data for
 * @param {Integer} level - the output padding level
 */
Clean.prototype.handleBenchComp = function handleBenchComp(bench, level) {
  let timesFaster = bench.percentOps - 1;
  let adjective = 'Faster';

  if (timesFaster >= 0) {
    adjective = 'Slower';
    timesFaster = 100 / timesFaster;
  }

  let fasterTitle = 'Times ' + adjective + ' than ' + bench.comp;
  this.outputData(fasterTitle, timesFaster.toFixed(2), level);
};

/**
 * Default data output and formatting
 *
 * @param {String} title - the title of the data being output
 * @param {String} value - the value associated with the title
 * @param {Integer} level - the output padding level
 */
Clean.prototype.outputData = function outputData(title, value, level) {
  let string = this.addPadding(level);
  string += '  - ' + title + ': ';
  string += chalk.cyan.dim(value);
  console.log(chalk.white(string));
};

/**
 * Outputs the data for a benches marks
 *
 * @param {Object} marks - the object containing the mark data
 * @param {Integer} level - the output padding level
 */
Clean.prototype.outputMarks = function outputMarks(marks, level) {
  let keys = Object.keys(marks);
  if (keys.length > 1) {
    let _this = this;
    keys.forEach(function(key) {
      _this.outputMark(marks[key], key, level);
    });
  }
};

/**
 * Outputs the data for a single mark
 *
 * @param {Object} mark - the mark to output the data for
 * @param {String} name - the name of the mark to output data for
 * @param {Integer} level - the output padding level
 */
Clean.prototype.outputMark = function outputMark(mark, name, level) {
  let str = this.addPadding(level);
  str += 'Mark: ' + name;
  console.log(chalk.gray(str));

  this.outputData('Ops Per Second', Math.round(mark.ops) + ' \u00B1 ' + Math.round(mark.opsMoe), level);
  this.outputData('Average Execution Time', this.formatTime(mark.mean), level);
  this.outputData('Median Execution TIme', this.formatTime(mark.median), level);
  this.outputData('Fastest Run', this.formatTime(mark.min), level);
  this.outputData('Slowest Run', this.formatTime(mark.max), level);

  let moePercent = (mark.moe * 100 / mark.mean).toFixed(2);
  this.outputData('Margin of Error', moePercent + '%', level);
};

/**
 * Adds appropriate padding to the output
 *
 * @param {Integer} level - how much padding to add
 * @returns {string} - the string representing the padding
 */
Clean.prototype.addPadding = function addPadding(level) {
  let str = '';
  for (let i = 0; i < level; i++) {
    str += '  ';
  }

  return str;
};

/**
 * Formats a time into an output appropriate value
 *
 * @param {Integer} val - the time in nanoseconds
 * @returns {string} - the formatted time string
 */
Clean.prototype.formatTime = function formatTime(val) {
  let unit = 'ns';

  if (val > 1e10) {
    val /= 1e9;
    unit = 'seconds';
  }

  if (val > 1e6) {
    val /= 1e6;
    unit = 'ms';
  }

  val = val.toFixed(2);

  val = val.toString() + ' ' + unit;

  return val;
};

module.exports = Clean;
