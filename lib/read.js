'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const pify = require('pify');
const fsp = pify(require('graceful-fs'));
const json3 = require('json3');
const traverse = require('traverse');

// local modules

const callbackify = require('./callbackify').callbackify;

// this module

function isFileReference (value) {
  return value && typeof value === 'object' && typeof value.$file === 'string';
}

function findReferences (data) {
  return new Promise((resolve, reject) => {
    const refs = [];
    /* eslint-disable no-invalid-this */ // traverse module's API
    traverse(data).forEach(function () {
      if (isFileReference(this.node)) {
        refs.push({
          path: this.path,
          target: this.node.$file,
          type: '$file'
        });
      }
    });
    /* eslint-enable no-invalid-this */
    resolve(refs);
  });
}

function jsonParse (string) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = json3.parse(string);
    } catch (err) {
      reject(err);
      return;
    }
    resolve(parsed);
  });
}

function resolveReferences (refs, originPath) {
  return Promise.all(
    refs.map((ref) => {
      return fsp.readFile(path.join(path.dirname(originPath), ref.target), 'utf8')
        .then((data) => {
          ref.value = data;
        });
    })
  );
}

function replaceReferences (data, originPath) {
  return findReferences(data)
    .then((refs) => {
      if (!refs.length) {
        // nothing to replace
        return data;
      }
      return resolveReferences(refs, originPath)
        .then(() => {
          /* eslint-disable no-invalid-this */ // traverse module's API
          const result = traverse(data).map(function () {
            if (isFileReference(this.node)) {
              const matchingRefs = refs.filter((ref) => {
                return ref.type === '$file' && ref.target === this.node.$file;
              });
              if (!matchingRefs.length) {
                return Promise.reject(new Error(`unresolved ref $file ${this.node.$file}`));
              }
              this.update(matchingRefs[0].value, true);
            }
          });
          /* eslint-enable no-invalid-this */
          return result;
        });
    });
}

function readJSON (options) {
  return fsp.readFile(options.filePath, 'utf8')
    .then(jsonParse);
}

function readData (options) {
  return readJSON(options)
    .then((data) => {
      return replaceReferences(data, options.filePath);
    });
}

module.exports = {
  findReferences,
  isFileReference,
  jsonParse,
  readData: callbackify(readData),
  readJSON
};
