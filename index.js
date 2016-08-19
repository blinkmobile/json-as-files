'use strict';

// local modules

const read = require('./lib/read.js');
const refs = require('./lib/refs.js');
const write = require('./lib/write.js');

// this module

/* ::
export type JSONObject = { [id:string]: mixed }
*/

module.exports = {
  findReferences: refs.findReferences,
  isFileReference: refs.isFileReference,
  readData: read.readData,
  planWriteData: write.planWriteData,
  writeData: write.writeData,
  writePlan: write.writePlan
};
