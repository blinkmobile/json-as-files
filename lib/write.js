'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const pify = require('pify');
const fsp = pify(require('graceful-fs'));
const isEqual = require('lodash.isequal');
const json3 = require('json3');
const traverse = require('traverse');

// local modules

const callbackify = require('./callbackify').callbackify;
const findReferences = require('./read').findReferences;
const readJSON = require('./read').readJSON;

// this module

function jsonStringify (value) {
  return new Promise((resolve, reject) => {
    let string;
    try {
      string = json3.stringify(value, null, 2);
    } catch (err) {
      reject(err);
      return;
    }
    resolve(string);
  });
}

function getPathValue (data, dataPath) {
  const firstStep = data[dataPath[0]];
  if (dataPath.length === 1 || typeof firstStep === 'undefined') {
    return firstStep;
  }
  return getPathValue(firstStep, dataPath.slice(1));
}

function pruneReferencedValues (options) { // { data, originPath, refs }
  return new Promise((resolve) => {
    let result;
    /* eslint-disable no-invalid-this */ // traverse module's API
    result = traverse(options.data).map(function () {
      const matchingRefs = options.refs.filter((ref) => {
        return isEqual(ref.path, this.path);
      });
      if (matchingRefs.length) {
        this.update({ $file: matchingRefs[0].target }, true);
      }
    });
    /* eslint-enable no-invalid-this */
    resolve(result);
  });
}

function buildPlan (options) { // { data, originPath, refs, template }
  const writeOps = options.refs
    .map((ref) => { // convert to [ { targetPath, value }, ... ]
      const value = getPathValue(options.data, ref.path);
      const targetPath = path.join(path.dirname(options.originPath), ref.target);
      return { targetPath, value };
    })
    .filter((writeOp) => { // remove any with undefined value
      return typeof writeOp.value !== 'undefined';
    });

  return pruneReferencedValues(options)
    .then((result) => {
      writeOps.push({ targetPath: options.originPath, value: result });
      return writeOps;
    });
}

function writeJSON (options) { // { data, filePath }
  return jsonStringify(options.data)
    .then((string) => {
      return fsp.writeFile(options.filePath, string, 'utf8');
    });
}

function getTemplate (options) { // { filePath, template }
  if (options.template) {
    return Promise.resolve(options.template);
  }

  return fsp.access(options.filePath, fsp.F_OK)
    .then(() => readJSON({ filePath: options.filePath }))
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // if file doesn't yet exist, just return an empty template
        return {};
      }
      throw err;
    });
}

function planWriteData (options) { // { data, filePath, template }
  let template;
  return getTemplate(options)
    .then((t) => {
      template = t;
      return findReferences(template);
    })
    .then((refs) => buildPlan({
      data: options.data,
      originPath: options.filePath,
      refs,
      template
    }));
}

function writePlan (options) { // { plan: [ { targetPath, value }, ... ] }
  return Promise.all(options.plan.map((writeOp) => {
    if (typeof writeOp.value === 'string') {
      return fsp.writeFile(writeOp.targetPath, writeOp.value, 'utf8');
    }
    return writeJSON({ data: writeOp.value, filePath: writeOp.targetPath });
  }));
}

function writeData (options) { // { data, filePath, template }
  return planWriteData(options)
    .then((plan) => writePlan({ plan }));
}

module.exports = {
  jsonStringify,
  planWriteData: callbackify(planWriteData),
  writeData: callbackify(writeData),
  writePlan: callbackify(writePlan)
};
