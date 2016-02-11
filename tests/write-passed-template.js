'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const pify = require('pify');
const fsp = pify(require('graceful-fs'));
const temp = pify(require('temp').track());
const test = require('ava');

// local modules

const readJSON = require('../lib/read').readJSON;
const pkg = require('../package.json');
const readData = require('..').readData;
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
  return temp.mkdir(`${pkg.name.replace(/\//g, '-')}-`)
    .then((dirPath) => {
      t.context.tempDir = dirPath;
      t.context.jsonPath = path.join(dirPath, 'files.json');
    })
    .then(() => readJSON({
      filePath: path.join(__dirname, 'fixtures', 'files.json')
    }))
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
  return readJSON({ filePath: t.context.jsonPath })
    .then((rawData) => {
      t.is(typeof rawData.deep.nested.abc, 'object');
      t.is(rawData.deep.nested.abc.$file, 'abc.txt');
      t.is(typeof rawData.deep.nested.array[1], 'object');
      t.is(rawData.deep.nested.array[1].$file, 'ghi.txt');
    })
    .then(() => readData({ filePath: t.context.jsonPath }))
    .then((output) => {
      t.same(output, INPUT);
    });
});
