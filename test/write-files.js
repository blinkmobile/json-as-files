'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const loadJson = require('load-json-file');
const fsp = require('@jokeyrhyme/pify-fs');
const test = require('ava');

// local modules

const isFileReference = require('../lib/read').isFileReference;
const readData = require('..').readData;
const temp = require('./helpers/temp.js');
const writeData = require('..').writeData;

// this module

const INPUT = {
  deep: {
    nested: {
      abc: 'new abc',
      array: [
        456,
        'new ghi'
      ]
    }
  }
};

let FILES_PATH;

test.beforeEach((t) => {
  return temp.makeContextTempDirWithFixture(t, 'files.json')
    .then(() => {
      FILES_PATH = path.join(t.context.tempDir, 'files.json');
    })
    .then(() => writeData({ filePath: FILES_PATH, data: INPUT }));
});

test('expected contents: abc.txt, ghi.txt', (t) => {
  const ABC_PATH = path.join(t.context.tempDir, 'abc.txt');
  const GHI_PATH = path.join(t.context.tempDir, 'ghi.txt');
  return fsp.readFile(ABC_PATH, 'utf8')
    .then((abc) => {
      t.is(abc, INPUT.deep.nested.abc);

      return fsp.readFile(GHI_PATH, 'utf8');
    })
    .then((ghi) => {
      t.is(ghi, INPUT.deep.nested.array[1]);
    });
});

test('expected contents: files.json', (t) => {
  return loadJson(FILES_PATH)
    .then((rawData) => {
      t.truthy(isFileReference(rawData.deep.nested.abc));
      t.is(rawData.deep.nested.abc.$file, 'abc.txt');
      t.truthy(isFileReference(rawData.deep.nested.array[1]));
      t.is(rawData.deep.nested.array[1].$file, 'ghi.txt');

      return readData({ filePath: FILES_PATH });
    })
    .then((output) => {
      t.deepEqual(output, INPUT);
    });
});
