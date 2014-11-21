'use strict';

function Plain() {

}

Plain.prototype.output = function * output(data) {
  console.log(data);
};

module.exports = Plain;
