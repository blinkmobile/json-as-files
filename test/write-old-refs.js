'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const test = require('ava');

// local modules

const fsHelpers = require('./helpers/fs.js');
const readData = require('..').readData;
const temp = require('./helpers/temp.js');
const writeData = require('..').writeData;

// this module

const INPUT = {
  deep: {
    nested: {
      array: [
        456
      ]
    }
  }
};

let FILES_PATH;

test.beforeEach((t) => {
  return temp.makeContextTempDirWithFixture(t, 'old-refs.json')
    .then(() => {
      FILES_PATH = path.join(t.context.tempDir, 'old-refs.json');
    })
    .then(() => writeData({ filePath: FILES_PATH, data: INPUT }));
});

test('expected missing files: old-abc.txt, old-ghi.txt', (t) => {
  const ABC_PATH = path.join(t.context.tempDir, 'old-abc.txt');
  const GHI_PATH = path.join(t.context.tempDir, 'old-ghi.txt');
  return Promise.all([
    fsHelpers.assertFileNotExists(t, ABC_PATH),
    fsHelpers.assertFileNotExists(t, GHI_PATH)
  ]);
});

test('expected contents: files.json', (t) => {
  return readData({ filePath: FILES_PATH })
    .then((output) => {
      t.deepEqual(output, INPUT);
    });
});
