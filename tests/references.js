/* @flow */
'use strict';

const path = require('path');

const loadJson = require('load-json-file');
const test = require('ava');

const findReferences = require('../index.js').findReferences;
const isFileReference = require('../index.js').isFileReference;

test('isFileReference()', (t) => {
  t.is(isFileReference(), false);
  t.is(isFileReference({}), false);
  t.is(isFileReference({ $file: 123 }), false);
  t.is(isFileReference({ $file: 'abc' }), true);
});

test('findReferences() with no references in JSON', (t) =>
  loadJson(path.join(__dirname, 'fixtures', 'plain.json'))
    .then(findReferences)
    .then((refs) => {
      t.is(Array.isArray(refs), true);
      t.is(refs.length, 0);
    })
);

test('findReferences() with some references in JSON', (t) =>
  loadJson(path.join(__dirname, 'fixtures', 'files.json'))
    .then(findReferences)
    .then((refs) => {
      t.is(Array.isArray(refs), true);
      t.deepEqual(refs, [
        { path: ['deep', 'nested', 'abc'], target: 'abc.txt', type: '$file' },
        { path: ['deep', 'nested', 'array', '1'], target: 'ghi.txt', type: '$file' }
      ]);
    })
);
