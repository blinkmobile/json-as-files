'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const fs = require('graceful-fs');
const isEqual = require('lodash.isequal');
const json3 = require('json3');
const traverse = require('traverse');

// local modules

const findReferences = require('./read').findReferences;
const readJSON = require('./read').readJSON;

// this module

function fsExists (filePath) {
  return new Promise((resolve) => {
    fs.access(filePath, fs.F_OK, (err) => {
      if (err) {
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
}

function fsWriteFile (filePath, contents, options) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, contents, options, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

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

function writeJSON (options) { // { data, filePath }
  return jsonStringify(options.data)
    .then((string) => {
      return fsWriteFile(options.filePath, string, 'utf8');
    });
}

function writeReferencedValues (options) { // { data, originPath, refs }
  return Promise.all(
    options.refs.map((ref) => {
      const value = getPathValue(options.data, ref.path);
      if (typeof value === 'undefined') {
        return Promise.resolve();
      }
      const targetPath = path.join(path.dirname(options.originPath), ref.target);
      return fsWriteFile(targetPath, value, 'utf8');
    })
  );
}

function processReferencedValues (options) {
  return writeReferencedValues(options)
    .then(() => {
      return pruneReferencedValues(options);
    });
}

function writeData (options) { // { data, filePath }
  let hasWritten = false;
  return fsExists(options.filePath)
    .then((isExists) => {
      if (!isExists) {
        hasWritten = true;
        return writeJSON(options);
      }
      return readJSON({ filePath: options.filePath });
    })
    .then(findReferences) // collect references from existing file
    .then((refs) => {
      if (!hasWritten && !refs.length) {
        hasWritten = true;
        return writeJSON(options);
      }
      return processReferencedValues({
        data: options.data,
        originPath: options.filePath,
        refs
      });
    })
    .then((data) => {
      if (!hasWritten) {
        return writeJSON({ data, filePath: options.filePath });
      }
    });
}

module.exports = {

  fsWriteFile,
  jsonStringify,

  writeData (options, callback) {
    const cb = callback || (() => {});
    return writeData(options)
      .then(() => {
        cb(null);
        return Promise.resolve(); // propagate result to caller
      })
      .catch((err) => {
        cb(err);
        return Promise.reject(err); // propagate error to caller
      });
  }

};
