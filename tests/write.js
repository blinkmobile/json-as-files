'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const fs = require('graceful-fs');
const mkdirp = require('mkdirp');
const test = require('ava');

// local modules

const readData = require('..').readData;
const writeData = require('..').writeData;

// this module

const TEMP_ROOT = path.join(__dirname, '..', 'tmp');
const fixture = require('./fixtures/plain.json');

test.before(`mkdir -p TEMP_ROOT`, (t) => {
  mkdirp(TEMP_ROOT, (err) => {
    t.ifError(err);
    t.end();
  });
});

test.beforeEach('rm TEMP_ROOT/plain.json', (t) => {
  t.context.filePath = path.join(TEMP_ROOT, 'plain.json');
  fs.unlink(t.context.filePath, (err) => {
    if (err && err.code !== 'ENOENT') { // it's fine if the file is already gone
      t.ifError(err);
    }
    t.end();
  });
});

test('writeData({ filePath: "./fixtures/plain.json" })', (t) => {
  writeData({ filePath: t.context.filePath, data: fixture })
  .then(() => readData({ filePath: t.context.filePath }))
  .then((data) => {
    t.same(data, fixture);
    t.end();
  });
});

test('writeData({ filePath: "./fixtures/plain.json" }, callback)', (t) => {
  writeData({ filePath: t.context.filePath, data: fixture }, (err) => {
    t.ifError(err);
    readData({ filePath: t.context.filePath }, (readErr, data) => {
      t.ifError(readErr);
      t.same(data, fixture);
      t.end();
    });
  });
});
