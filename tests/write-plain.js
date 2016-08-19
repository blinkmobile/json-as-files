'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const pify = require('pify');
const fsp = require('@jokeyrhyme/pify-fs');
const mkdirpp = pify(require('mkdirp'));
const test = require('ava');

// local modules

const readData = require('..').readData;
const writeData = require('..').writeData;

// this module

const TEMP_ROOT = path.join(__dirname, '..', 'tmp');
const fixture = require('./fixtures/plain.json');

function fsUnlinkFile (filePath) {
  return fsp.unlink(filePath)
    .catch((err) => {
      // it's fine if the file is already gone
      if (err.code !== 'ENOENT') {
        throw err;
      }
    });
}

test.before(`mkdir -p TEMP_ROOT`, (t) => mkdirpp(TEMP_ROOT));

test.beforeEach('rm ../tmp/plain.json', (t) => {
  t.context.filePath = path.join(TEMP_ROOT, 'plain.json');
  return fsUnlinkFile(t.context.filePath);
});

test('writeData({ filePath: "../tmp/plain.json", data: ... })', (t) => {
  return writeData({ filePath: t.context.filePath, data: fixture })
  .then(() => readData({ filePath: t.context.filePath }))
  .then((data) => {
    t.deepEqual(data, fixture);
  });
});

test.cb('writeData({ filePath: "../tmp/plain.json", data: ... } callback)', (t) => {
  writeData({ filePath: t.context.filePath, data: fixture }, (err) => {
    t.ifError(err);
    readData({ filePath: t.context.filePath }, (readErr, data) => {
      t.ifError(readErr);
      t.deepEqual(data, fixture);
      t.end();
    });
  });
});
