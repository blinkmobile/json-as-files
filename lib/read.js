'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const fs = require('graceful-fs');
const json3 = require('json3');
const traverse = require('traverse');

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

function fsReadFile (filePath, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, options, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
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
      return fsReadFile(path.join(path.dirname(originPath), ref.target), 'utf8')
        .then((data) => {
          ref.value = data;
          return Promise.resolve();
        });
    })
  );
}

function replaceReferences (data, originPath) {
  return findReferences(data)
    .then((refs) => {
      if (!refs.length) {
        // nothing to replace
        return Promise.resolve(data);
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
          return Promise.resolve(result);
        });
    });
}

function readData (options, callback) {
  const cb = callback || (() => {});
  return fsReadFile(options.filePath, 'utf8')
    .then(jsonParse)
    .then((data) => {
      return replaceReferences(data, options.filePath);
    })
    .then((data) => {
      cb(null, data);
      return Promise.resolve(data); // propagate result to caller
    })
    .catch((err) => {
      cb(err);
      return Promise.reject(err); // propagate error to caller
    });
}

module.exports = {
  fsReadFile,
  jsonParse,
  readData
};
