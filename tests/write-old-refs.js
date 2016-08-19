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
const FILES_PATH = path.join(TEMP_ROOT, 'old-refs.json');

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

test.beforeEach('copy ./fixtures/old-refs.json -> ../tmp/old-refs.json', () => {
  return fsp.readFile(path.join(__dirname, 'fixtures', 'old-refs.json'), 'utf8')
    .then((contents) => {
      return fsp.writeFile(path.join(TEMP_ROOT, 'old-refs.json'), contents, 'utf8');
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
  return Promise.all([
    fsp.access(ABC_PATH, fsp.F_OK)
      .then(() => t.fail('resolved'))
      .catch(() => t.pass('missing')),
    fsp.access(GHI_PATH, fsp.F_OK)
      .then(() => t.fail('resolved'))
      .catch(() => t.pass('missing'))
  ]);
});

test('expected contents: files.json', (t) => {
  return readData({ filePath: FILES_PATH })
    .then((output) => {
      t.deepEqual(output, INPUT);
    });
});
