Clean.prototype.output = function * output(data, level) {
  if (!level) {
    level = 2;
  }
  var i = 0;
  while (i < data.length) {
    var suite = data[i];

    yield this.outputSuite(suite, level);

    i++;
    suite = null;
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
  console.log(color(str));
  str = null;

  var str2 = this.addPadding(level + 1);
  str2 += '- Execution Time: ';
  str2 += chalk.cyan.dim(suiteTime);

  console.log(chalk.white(str2));
  str2 = null;

  if (suite.benches) {
    var length = suite.benches.length;
    var i = 0;
    while (i < length) {
      yield this.outputBench(suite.benches[i], level + 3)
      i++;
    }
  }
  suite.benches = null;

  if (suite.suites) {
    yield this.output(suite.suites, level + 2);
  }
  suite.suites = null;
  suite = null;
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
  str = null;

  var benchPadding = this.addPadding(level + 1);

  var str3 = benchPadding;
  str3 += '- Ops Per Second: ';
  str3 += chalk.cyan.dim(Math.round(bench.ops));
  str3 += chalk.cyan.dim(' \u00B1 ');
  str3 += chalk.cyan.dim(Math.round(bench.opsMoe));
  console.log(chalk.white(str3));
  str3 = null;

  var str4 = benchPadding;
  str4 += '- Average Execution Time: ';
  str4 += chalk.cyan.dim(yield this.formatTime(bench.mean));
  console.log(chalk.white(str4));
  str4 = null;

  var str5 = benchPadding;
  str5 += '- Median Execution Time: ';
  str5 += chalk.cyan.dim(yield this.formatTime(bench.median));
  console.log(chalk.white(str5));
  str5 = null;

  var str6 = benchPadding;
  str6 += '- Fastest Run: ';
  str6 += chalk.cyan.dim(yield this.formatTime(bench.min));
  console.log(chalk.white(str6));
  str6 = null;

  var str7 = benchPadding;
  str7 += '- Slowest Run: ';
  str7 += chalk.cyan.dim(yield this.formatTime(bench.max));
  console.log(chalk.white(str7));
  str7 = null;

  var str8 = benchPadding;
  str8 += '- Error Rate: ';
  str8 += chalk.cyan.dim(bench.errorRate + '%');
  console.log(chalk.white(str8));
  str8 = null;

  var moePercent = (bench.moe * 100 / bench.mean).toFixed(2);
  var str9 = benchPadding;
  str9 += '- Margin of Error: ';
  str9 += chalk.cyan.dim(moePercent + '%');
  console.log(chalk.white(str9));
  str9 = null;

  var str2 = benchPadding;
  str2 += '- Execution Time: ';
  str2 += chalk.cyan.dim(yield this.formatTime(bench.elapsed));
  console.log(chalk.white(str2));
  str2 = null;

  if(bench.marks) {
    yield this.outputMarks(bench.marks, level + 3);
  }

  bench.marks = null;
};

Clean.prototype.outputMarks = function * outputMarks(marks, level) {
  var keys = Object.keys(marks);
  var length = keys.length;
  if (length > 1) {
    var i = 0;
    while (i < length) {
      yield this.outputMark(marks[keys[i]], keys[i], level);
      i++;
    }
  }

  keys = null;
};

Clean.prototype.outputMark = function * outputMark(mark, name, level) {
  var str = this.addPadding(level);
  str += 'Mark: ' + name;
  console.log(chalk.gray(str));

  var benchPadding = this.addPadding(level + 1);

  var str3 = benchPadding;
  str3 += '- Ops Per Second: ';
  str3 += chalk.cyan.dim(Math.round(mark.ops));
  str3 += chalk.cyan.dim(' \u00B1 ');
  str3 += chalk.cyan.dim(Math.round(mark.opsMoe));
  console.log(chalk.white(str3));

  var str4 = benchPadding;
  str4 += '- Average Execution Time: ';
  str4 += chalk.cyan.dim(yield this.formatTime(mark.mean));
  console.log(chalk.white(str4));

  var str5 = benchPadding;
  str5 += '- Median Execution Time: ';
  str5 += chalk.cyan.dim(yield this.formatTime(mark.median));
  console.log(chalk.white(str5));

  var str6 = benchPadding;
  str6 += '- Fastest Run: ';
  str6 += chalk.cyan.dim(yield this.formatTime(mark.min));
  console.log(chalk.white(str6));

  var str7 = benchPadding;
  str7 += '- Slowest Run: ';
  str7 += chalk.cyan.dim(yield this.formatTime(mark.max));
  console.log(chalk.white(str7));

  var moePercent = (mark.moe * 100 / mark.mean).toFixed(2);
  var str9 = benchPadding;
  str9 += '- Margin of Error: ';
  str9 += chalk.cyan.dim(moePercent + '%');
  console.log(chalk.white(str9));
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
