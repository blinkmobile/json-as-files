'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const loadJson = require('load-json-file');
const fsp = require('@jokeyrhyme/pify-fs');
const test = require('ava');

// local modules

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

test.beforeEach((t) => {
  return temp.makeContextTempDir(t)
    .then(() => {
      t.context.jsonPath = path.join(t.context.tempDir, 'files.json');
    })
    .then(() => loadJson(path.join(__dirname, 'fixtures', 'files.json')))
    .then((template) => writeData({
      data: INPUT,
      filePath: t.context.jsonPath,
      template
    }));
});

test('expected contents: abc.txt, ghi.txt', (t) => {
  const ABC_PATH = path.join(t.context.tempDir, 'abc.txt');
  const GHI_PATH = path.join(t.context.tempDir, 'ghi.txt');
  return Promise.all([
    fsp.readFile(ABC_PATH, 'utf8')
      .then((abc) => t.is(abc, INPUT.deep.nested.abc)),
    fsp.readFile(GHI_PATH, 'utf8')
      .then((ghi) => t.is(ghi, INPUT.deep.nested.array[1]))
  ]);
});

test('expected contents: files.json', (t) => {
  return loadJson(t.context.jsonPath)
    .then((rawData) => {
      t.is(typeof rawData.deep.nested.abc, 'object');
      t.is(rawData.deep.nested.abc.$file, 'abc.txt');
      t.is(typeof rawData.deep.nested.array[1], 'object');
      t.is(rawData.deep.nested.array[1].$file, 'ghi.txt');
    })
    .then(() => readData({ filePath: t.context.jsonPath }))
    .then((output) => {
      t.deepEqual(output, INPUT);
    });
});
