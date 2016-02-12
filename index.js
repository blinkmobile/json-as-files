'use strict';

// local modules

const readData = require('./lib/read').readData;
const write = require('./lib/write');

// this module

module.exports = {
  readData,
  planWriteData: write.planWriteData,
  writeData: write.writeData,
  writePlan: write.writePlan
};
