'use strict';

function Clean() {

}

Clean.prototype.output = function * output(data) {
  var i = 0;
  while (i < data.length) {
    var suite = data[i];

    yield * this.outputSuite(suite);

    i++;
  }
};

Clean.prototype.outputSuite = function * outputSuite(suite) {
  var suiteTime = yield this.formatTime(suite.elapsed);

  console.log(suite.name);
  console.log(' - ');
  console.log(suiteTime);
};

Clean.prototype.formatTime = function * formatTime(val) {
  var unit = 'ns';

  if(val > 1e10) {
    val /= 1e9;
    unit = 'seconds';
  }

  if(val > 1e6) {
    val /= 1e6;
    unit = 'ms';
  }

  if (!Number.isInteger(val)) {
    val = val.toFixed(4);
  }

  val = val.toString() + ' ' + unit;

  return val;
};

module.exports = Clean;
