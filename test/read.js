'use strict';

// foreign modules

const fsp = require('@jokeyrhyme/pify-fs');
const test = require('ava');

// local modules

const readData = require('..').readData;

// this module

const plain = require('./fixtures/plain.json');

process.chdir(__dirname); // adjust for cwd in ava 0.17+

let abc;
test.before('load abc.txt', (t) => {
  return fsp.readFile('./fixtures/abc.txt', 'utf8')
  .then((data) => {
    abc = data;
  });
});

let ghi;
test.before('load ghi.txt', (t) => {
  return fsp.readFile('./fixtures/ghi.txt', 'utf8')
  .then((data) => {
    ghi = data;
  });
});

test('readData({ filePath: "./fixtures/nonexistant.json" })', (t) => {
  readData({ filePath: './fixtures/nonexistant.json' })
  .then(() => {
    t.fail('should not resolve');
  })
  .catch((err) => {
    t.truthy(err);
  });
});

test('readData({ filePath: "./fixtures/plain.json" })', (t) => {
  return readData({ filePath: './fixtures/plain.json' })
  .then((data) => {
    t.deepEqual(data, plain);
  });
});

test.cb('readData({ filePath: "./fixtures/plain.json" }, callback)', (t) => {
  readData({ filePath: './fixtures/plain.json' }, (err, data) => {
    t.ifError(err);
    t.deepEqual(data, plain);
    t.end();
  });
});

test('readData({ filePath: "./fixtures/files.json" })', (t) => {
  return readData({ filePath: './fixtures/files.json' })
  .then((data) => {
    t.is(data.deep.nested.abc, abc);
    t.is(data.deep.nested.array[1], ghi);
  });
});
