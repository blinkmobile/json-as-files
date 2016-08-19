/* @flow */
'use strict';

// foreign modules

const traverse = require('traverse');

// this module

function isFileReference (
  value /* : mixed */
) /* : boolean */ {
  return !!value && typeof value === 'object' && typeof value.$file === 'string';
}

/* ::
type RefType = '$file'
*/

/* ::
export type Ref = {
  path: Array<string>,
  target: string,
  type: RefType,
  value?: string
}
*/

/* :: import type { JSONObject } from '../index.js' */

function findReferences (
  data /* : JSONObject */
) /* : Promise<Array<Ref>> */ {
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

module.exports = {
  findReferences,
  isFileReference
};
