'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const fs = require('graceful-fs');
const mkdirp = require('mkdirp');
const test = require('ava');

// local modules

const fsReadFile = require('../lib/read').fsReadFile;
const fsWriteFile = require('../lib/write').fsWriteFile;
const readData = require('..').readData;
const writeData = require('..').writeData;

// this module

const TEMP_ROOT = path.join(__dirname, '..', 'tmp');
const fixture = require('./fixtures/plain.json');

function fsUnlinkFile (filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') { // it's fine if the file is already gone
        reject(err);
        return;
      }
      resolve();
    });
  });
}

test.before(`mkdir -p TEMP_ROOT`, (t) => {
  mkdirp(TEMP_ROOT, (err) => {
    t.ifError(err);
    t.end();
  });
});

test.before('copy ./fixtures/files.json -> ../tmp/files.json', () => {
  return fsReadFile(path.join(__dirname, 'fixtures', 'files.json'), 'utf8')
    .then((contents) => {
      return fsWriteFile(path.join(TEMP_ROOT, 'files.json'), contents, 'utf8');
    });
});

test.before('rm TEMP_ROOT/abc.txt', () => {
  return fsUnlinkFile(path.join(TEMP_ROOT, 'abc.txt'));
});

test.before('rm TEMP_ROOT/ghi.txt', () => {
  return fsUnlinkFile(path.join(TEMP_ROOT, 'ghi.txt'));
});

test.beforeEach('rm TEMP_ROOT/plain.json', (t) => {
  t.context.filePath = path.join(TEMP_ROOT, 'plain.json');
  return fsUnlinkFile(t.context.filePath);
});

test('writeData({ filePath: "./fixtures/plain.json" })', (t) => {
  return writeData({ filePath: t.context.filePath, data: fixture })
  .then(() => readData({ filePath: t.context.filePath }))
  .then((data) => {
    t.same(data, fixture);
  });
});

test('writeData({ filePath: "./fixtures/plain.json" }, callback)', (t) => {
  return writeData({ filePath: t.context.filePath, data: fixture }, (err) => {
    t.ifError(err);
    return readData({ filePath: t.context.filePath }, (readErr, data) => {
      t.ifError(readErr);
      t.same(data, fixture);
    });
  });
});
