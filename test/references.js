'use strict';

const path = require('path');

const loadJson = require('load-json-file');
const test = require('ava');

const findReferences = require('../index.js').findReferences;
const isFileInReferences = require('../index.js').isFileInReferences;
const isFileReference = require('../index.js').isFileReference;

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

test('isFileReference()', (t) => {
  t.is(isFileReference(), false);
  t.is(isFileReference({}), false);
  t.is(isFileReference({ $file: 123 }), false);
  t.is(isFileReference({ $file: 'abc' }), true);
});

test('isFileInReferences() with no matches, files in CWD', (t) => {
  const refs = [
    { path: ['deep', 'nested', 'abc'], target: 'abc.txt', type: '$file' }
  ];
  const result = isFileInReferences(refs, 'data.json', 'nomatch.txt');
  t.is(result, false);
});

test('isFileInReferences() with a match, files in CWD', (t) => {
  const refs = [
    { path: ['deep', 'nested', 'abc'], target: 'abc.txt', type: '$file' }
  ];
  const result = isFileInReferences(refs, 'data.json', 'abc.txt');
  t.is(result, true);
});

test('isFileInReferences() with no matches, files in CWD sub-directory', (t) => {
  const refs = [
    { path: ['deep', 'nested', 'abc'], target: 'abc.txt', type: '$file' }
  ];
  const result = isFileInReferences(refs, 'subdir/data.json', 'subdir/nomatch.txt');
  t.is(result, false);
});

test('isFileInReferences() with a match, files in CWD sub-directory', (t) => {
  const refs = [
    { path: ['deep', 'nested', 'abc'], target: 'abc.txt', type: '$file' }
  ];
  const result = isFileInReferences(refs, 'subdir/data.json', 'subdir/abc.txt');
  t.is(result, true);
});

test('isFileInReferences() with no matches, file in sub-sub-directory', (t) => {
  const refs = [
    { path: ['deep', 'nested', 'abc'], target: 'subsub/abc.txt', type: '$file' }
  ];
  const result = isFileInReferences(refs, 'subdir/data.json', 'subdir/subsub/nomatch.txt');
  t.is(result, false);
});

test('isFileInReferences() with a match, file in sub-sub-directory', (t) => {
  const refs = [
    { path: ['deep', 'nested', 'abc'], target: 'subsub/abc.txt', type: '$file' }
  ];
  const result = isFileInReferences(refs, 'subdir/data.json', 'subdir/subsub/abc.txt');
  t.is(result, true);
});
