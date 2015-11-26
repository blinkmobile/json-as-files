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
const isFileReference = require('../lib/read').isFileReference;
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

test.before('rm ../tmp/abc.txt', () => {
  return fsUnlinkFile(path.join(TEMP_ROOT, 'abc.txt'));
});

test.before('rm ../tmp/ghi.txt', () => {
  return fsUnlinkFile(path.join(TEMP_ROOT, 'ghi.txt'));
});

test.beforeEach('rm ../tmp/plain.json', (t) => {
  t.context.filePath = path.join(TEMP_ROOT, 'plain.json');
  return fsUnlinkFile(t.context.filePath);
});

test('writeData({ filePath: "../tmp/plain.json", data: ... })', (t) => {
  return writeData({ filePath: t.context.filePath, data: fixture })
  .then(() => readData({ filePath: t.context.filePath }))
  .then((data) => {
    t.same(data, fixture);
  });
});

test('writeData({ filePath: "../tmp/plain.json", data: ... } callback)', (t) => {
  writeData({ filePath: t.context.filePath, data: fixture }, (err) => {
    t.ifError(err);
    readData({ filePath: t.context.filePath }, (readErr, data) => {
      t.ifError(readErr);
      t.same(data, fixture);
      t.end();
    });
  });
});

test('writeData({ filePath: "../tmp/files.json", data: ... })', (t) => {
  const ABC_PATH = path.join(TEMP_ROOT, 'abc.txt');
  const GHI_PATH = path.join(TEMP_ROOT, 'ghi.txt');
  const FILES_PATH = path.join(TEMP_ROOT, 'files.json');
  const data = {
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
  const expected = {
    deep: {
      nested: {
        abc: { '$file': 'abc.txt' },
        array: [
          456,
          { '$file': 'abc.txt' }
        ]
      }
    }
  };
  return writeData({ filePath: FILES_PATH, data })
    .then(() => {
      return fsReadFile(ABC_PATH);
    })
    .then((abc) => {
      t.is(abc, data.deep.nested.abc);

      return fsReadFile(GHI_PATH);
    })
    .then((ghi) => {
      t.is(ghi, data.deep.nested.array[1]);

      return fsReadFile(FILES_PATH);
    })
    .then((rawFile) => {
      const rawData = JSON.parse(rawFile);
      t.ok(isFileReference(rawData.deep.nested.abc));
      t.is(rawData.deep.nested.abc.$file, 'abc.txt');
      t.ok(isFileReference(rawData.deep.nested.array[1]));
      t.is(rawData.deep.nested.array[1].$file, 'ghi.txt');

      return readData(FILES_PATH);
    })
    .then((output) => {
      t.same(output, expected);
    });
});
