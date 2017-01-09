'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const test = require('ava');

// local modules

const readData = require('..').readData;
const temp = require('./helpers/temp.js');
const writeData = require('..').writeData;

// this module

const fixture = require('./fixtures/plain.json');

test.beforeEach((t) => temp.makeContextTempDir(t));

test('writeData({ filePath: "../tmp/plain.json", data: ... })', (t) => {
  const filePath = path.join(t.context.tempDir, 'plain.json');
  return writeData({ filePath, data: fixture })
  .then(() => readData({ filePath }))
  .then((data) => {
    t.deepEqual(data, fixture);
  });
});

test.cb('writeData({ filePath: "../tmp/plain.json", data: ... } callback)', (t) => {
  const filePath = path.join(t.context.tempDir, 'plain.json');
  writeData({ filePath, data: fixture }, (err) => {
    t.ifError(err);
    readData({ filePath }, (readErr, data) => {
      t.ifError(readErr);
      t.deepEqual(data, fixture);
      t.end();
    });
  });
});
