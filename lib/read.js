/* @flow */
'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const loadJson = require('load-json-file');
const fsp = require('@jokeyrhyme/pify-fs');
const traverse = require('traverse');

// local modules

const callbackify = require('./callbackify.js').callbackify;
const findReferences = require('./refs.js').findReferences;
const isFileReference = require('./refs.js').isFileReference;

// this module

/* :: import type { Ref } from './refs.js' */

function resolveReferences (
  refs /* : Array<Ref> */,
  originPath /* : string */
) /* : Promise<Array<void>> */ {
  return Promise.all(
    refs.map((ref) => {
      return fsp.readFile(path.join(path.dirname(originPath), ref.target), 'utf8')
        .then((data) => {
          ref.value = data;
        });
    })
  );
}

/* :: import type { JSONObject } from '../index.js' */

function replaceReferences (
  data /* : JSONObject */,
  originPath /* : string */
) /* : Promise<JSONObject> */ {
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

function readData (options) {
  return loadJson(options.filePath)
    .then((data) => {
      return replaceReferences(data, options.filePath);
    });
}

module.exports = {
  findReferences,
  isFileReference,
  readData: callbackify(readData)
};
