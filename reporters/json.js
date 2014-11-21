'use strict';

function JSONReporter() {

}

JSONReporter.prototype.output = function * output(data) {
  console.log(data);
};

module.exports = JSONReporter;
