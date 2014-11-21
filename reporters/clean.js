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

}

Clean.prototype.output = function * output(data, level) {
  if (!level) {
    level = 2;
  }
  var i = 0;
  while (i < data.length) {
    var suite = data[i];

    yield * this.outputSuite(suite, level);

    i++;
  }
};

Clean.prototype.outputSuite = function * outputSuite(suite, level) {
  var suiteTime = yield this.formatTime(suite.elapsed);

  var str = '';
  str += this.addPadding(level);
  var color = chalk.gray;
  if (suite.success === true) {
    str += check + ' ';
    color = chalk.green;
  }
  if (suite.success === false) {
    str += err + ' ';
    color = chalk.red;
  }
  str += 'Suite: ' + suite.name;

  var str2 = this.addPadding(level + 1);
  str2 += '- Execution Time: ';
  str2 += chalk.cyan.dim(suiteTime);

  console.log(color(str));
  console.log(str2);

  if (suite.benches) {
    var length = suite.benches.length;
    var i = 0;
    while (i < length) {
      yield this.outputBench(suite.benches[i], level + 3)
      i++;
    }
  }

  if (suite.suites) {
    yield this.output(suite.suites, level + 2);
  }
};

Clean.prototype.outputBench = function * outputBench(bench, level) {
  var str = '';
  str += this.addPadding(level);
  var color = chalk.gray;
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

  var benchPadding = this.addPadding(level + 1);

  var str3 = benchPadding;
  str3 += '- Ops Per Second: ';
  str3 += chalk.cyan.dim(Math.round(bench.ops));
  str3 += chalk.cyan.dim(' \u00B1 ');
  str3 += chalk.cyan.dim(Math.round(bench.opsMoe));
  console.log(str3);

  var str4 = benchPadding;
  str4 += '- Average Execution Time: ';
  str4 += chalk.cyan.dim(yield this.formatTime(bench.mean));
  console.log(str4);

  var str5 = benchPadding;
  str5 += '- Median Execution Time: ';
  str5 += chalk.cyan.dim(yield this.formatTime(bench.median));
  console.log(str5);

  var str6 = benchPadding;
  str6 += '- Fastest Run: ';
  str6 += chalk.cyan.dim(yield this.formatTime(bench.min));
  console.log(str6);

  var str7 = benchPadding;
  str7 += '- Slowest Run: ';
  str7 += chalk.cyan.dim(yield this.formatTime(bench.max));
  console.log(str7);

  var str8 = benchPadding;
  str8 += '- Error Rate: ';
  str8 += chalk.cyan.dim(bench.errorRate + '%');
  console.log(str8);

  var moePercent = (bench.moe * 100 / bench.mean).toFixed(2);
  var str9 = benchPadding;
  str9 += '- Margin of Error: ';
  str9 += chalk.cyan.dim(moePercent + '%');
  console.log(str9);

  var str2 = benchPadding;
  str2 += '- Execution Time: ';
  str2 += chalk.cyan.dim(yield this.formatTime(bench.elapsed));
  console.log(str2);

/*  if(bench.marks) {
    console.log(bench.marks);
  }*/
};

Clean.prototype.outputMark = function * outputMark(mark, level) {
  console.log(mark);
  console.log(level);
};

Clean.prototype.addPadding = function addPadding(level) {
  var str = '';
  for (var i = 0; i < level; i++) {
    str += '  ';
  }

  return str;
};

Clean.prototype.formatTime = function * formatTime(val) {
  var unit = 'ns';

  if (val > 1e10) {
    val /= 1e9;
    unit = 'seconds';
  }

  if (val > 1e6) {
    val /= 1e6;
    unit = 'ms';
  }

  if (!Number.isInteger(val)) {
    val = Math.round(val);
  }

  val = val.toString() + ' ' + unit;

  return val;
};

module.exports = Clean;
