'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const fs = require('graceful-fs');
const mkdirp = require('mkdirp');
const test = require('ava');

// local modules

const fsReadFile = require('../lib/read').fsReadFile;
const fsExists = require('../lib/write').fsExists;
const fsWriteFile = require('../lib/write').fsWriteFile;
const readData = require('..').readData;
const writeData = require('..').writeData;

// this module

const TEMP_ROOT = path.join(__dirname, '..', 'tmp');
const FILES_PATH = path.join(TEMP_ROOT, 'old-refs.json');

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

test.beforeEach('copy ./fixtures/old-refs.json -> ../tmp/old-refs.json', () => {
  return fsReadFile(path.join(__dirname, 'fixtures', 'old-refs.json'), 'utf8')
    .then((contents) => {
      return fsWriteFile(path.join(TEMP_ROOT, 'old-refs.json'), contents, 'utf8');
    });
});

['abc.txt', 'ghi.txt'].forEach((filename) => {
  test.before(`rm ../tmp/${filename}`, () => {
    return fsUnlinkFile(path.join(TEMP_ROOT, filename));
  });
});

const INPUT = {
  deep: {
    nested: {
      array: [
        456
      ]
    }
  }
};

test.beforeEach('writeData({ filePath: "../tmp/old-refs.json", data: ... })', (t) => {
  return writeData({ filePath: FILES_PATH, data: INPUT });
});

test('expected missing files: old-abc.txt, old-ghi.txt', (t) => {
  const ABC_PATH = path.join(TEMP_ROOT, 'old-abc.txt');
  const GHI_PATH = path.join(TEMP_ROOT, 'old-ghi.txt');
  return fsExists(ABC_PATH)
    .then((isExists) => {
      t.notOk(isExists);

      return fsExists(GHI_PATH);
    })
    .then((isExists) => {
      t.notOk(isExists);
    });
});

test('expected contents: files.json', (t) => {
  return readData({ filePath: FILES_PATH })
    .then((output) => {
      t.same(output, INPUT);
    });
});
