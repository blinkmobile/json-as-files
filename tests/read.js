'use strict';

// foreign modules

const test = require('ava');

// local modules

const fsReadFile = require('../lib/read').fsReadFile;
const readData = require('..').readData;

// this module

const plain = require('./fixtures/plain.json');

let abc;
test.before('load abc.txt', (t) => {
  fsReadFile('./fixtures/abc.txt', 'utf8')
  .then((data) => {
    abc = data;
    t.end();
  });
});

let ghi;
test.before('load ghi.txt', (t) => {
  fsReadFile('./fixtures/ghi.txt', 'utf8')
  .then((data) => {
    ghi = data;
    t.end();
  });
});

test('readData({ filePath: "./fixtures/nonexistant.json" })', (t) => {
  readData({ filePath: './fixtures/nonexistant.json' })
  .then(() => {
    t.fail('should not resolve');
    t.end();
  })
  .catch((err) => {
    t.ok(err);
    t.end();
  });
});

test('readData({ filePath: "./fixtures/plain.json" })', (t) => {
  readData({ filePath: './fixtures/plain.json' })
  .then((data) => {
    t.same(data, plain);
    t.end();
  })
  .catch((err) => {
    t.ifError(err);
    t.end();
  });
});

test('readData({ filePath: "./fixtures/plain.json" }, callback)', (t) => {
  readData({ filePath: './fixtures/plain.json' }, (err, data) => {
    t.ifError(err);
    t.same(data, plain);
    t.end();
  });
});

test('readData({ filePath: "./fixtures/files.json" })', (t) => {
  readData({ filePath: './fixtures/files.json' })
  .then((data) => {
    t.is(data.deep.nested.abc, abc);
    t.is(data.deep.nested.array[1], ghi);
    t.end();
  })
  .catch((err) => {
    t.ifError(err);
    t.end();
  });
});
