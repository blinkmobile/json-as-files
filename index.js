'use strict';

// local modules

const read = require('./lib/read');
const write = require('./lib/write');

// this module

module.exports = {
  findReferences: read.findReferences,
  isFileReference: read.isFileReference,
  readData: read.readData,
  planWriteData: write.planWriteData,
  writeData: write.writeData,
  writePlan: write.writePlan
};
