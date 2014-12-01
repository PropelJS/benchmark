'use strict';

let chalk = require('chalk');
let check = '✓';
let err = '✖';

if (process.platform === 'win32') {
  check = '\u221A';
  err = '\u00D7';
}

function Clean() {
}

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

  let str2 = this.addPadding(level + 1);
  str2 += '- Execution Time: ';
  str2 += chalk.cyan.dim(suiteTime);

  console.log(chalk.white(str2));
  str2 = null;

  if (suite.comp) {
    let fastest = this.addPadding(level + 1);
    fastest += '- Fastest was: ';
    fastest += chalk.cyan.dim(suite.fastest + ' - ' + Math.round(suite.fastestOps) + ' ops/second');
    console.log(chalk.white(fastest));

    let slowest = this.addPadding(level + 1);
    slowest += '- Slowest was: ';
    slowest += chalk.cyan.dim(suite.slowest + ' - ' + Math.round(suite.slowestOps) + ' ops/second');
    console.log(chalk.white(slowest));
  }

  let _this = this;
  suite.benches.forEach(function(bench) {
    _this.outputBench(bench, level + 2);
  });

  if (suite.children) {
    this.output(suite, level + 2);
  }
};

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
    let timesFaster = bench.percentOps - 1;
    timesFaster = timesFaster.toFixed(2);

    let isFaster = (timesFaster >= 0);

    let adjective = 'Faster';

    if (!isFaster) {
      adjective = 'Slower';
      timesFaster = 100 / timesFaster;
      timesFaster = timesFaster.toFixed(2);
    }

    let fasterTitle = 'Times ' + adjective + ' than ' + bench.comp;
    this.outputData(fasterTitle, timesFaster, level);
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

Clean.prototype.outputData = function outputData(title, value, level) {
  let string = this.addPadding(level);
  string += '  - ' + title + ': ';
  string += chalk.cyan.dim(value);
  console.log(chalk.white(string));
};

Clean.prototype.outputMarks = function outputMarks(marks, level) {
  let keys = Object.keys(marks);
  if (keys.length > 1) {
    let _this = this;
    keys.forEach(function(key) {
      _this.outputMark(marks[key], key, level);
    });
  }
};

Clean.prototype.outputMark = function outputMark(mark, name, level) {
  let str = this.addPadding(level);
  str += 'Mark: ' + name;
  console.log(chalk.gray(str));

  let benchPadding = this.addPadding(level + 1);

  let str3 = benchPadding;
  str3 += '- Ops Per Second: ';
  str3 += chalk.cyan.dim(Math.round(mark.ops));
  str3 += chalk.cyan.dim(' \u00B1 ');
  str3 += chalk.cyan.dim(Math.round(mark.opsMoe));
  console.log(chalk.white(str3));

  let str4 = benchPadding;
  str4 += '- Average Execution Time: ';
  str4 += chalk.cyan.dim(this.formatTime(mark.mean));
  console.log(chalk.white(str4));

  let str5 = benchPadding;
  str5 += '- Median Execution Time: ';
  str5 += chalk.cyan.dim(this.formatTime(mark.median));
  console.log(chalk.white(str5));

  let str6 = benchPadding;
  str6 += '- Fastest Run: ';
  str6 += chalk.cyan.dim(this.formatTime(mark.min));
  console.log(chalk.white(str6));

  let str7 = benchPadding;
  str7 += '- Slowest Run: ';
  str7 += chalk.cyan.dim(this.formatTime(mark.max));
  console.log(chalk.white(str7));

  let moePercent = (mark.moe * 100 / mark.mean).toFixed(2);
  let str9 = benchPadding;
  str9 += '- Margin of Error: ';
  str9 += chalk.cyan.dim(moePercent + '%');
  console.log(chalk.white(str9));
};

Clean.prototype.addPadding = function addPadding(level) {
  let str = '';
  for (let i = 0; i < level; i++) {
    str += '  ';
  }

  return str;
};

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
