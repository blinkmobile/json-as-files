'use strict';

// foreign modules

const test = require('ava');

// local modules

const readData = require('..').readData;

// this module

const fixture = require('./fixtures/plain.json');

test('readData({ filePath: "./fixtures/plain.json" })', (t) => {
  readData({ filePath: './fixtures/plain.json' })
  .then((data) => {
    t.same(data, fixture);
    t.end();
  });
});

test('readData({ filePath: "./fixtures/plain.json" }, callback)', (t) => {
  readData({ filePath: './fixtures/plain.json' }, (err, data) => {
    t.ifError(err);
    t.same(data, fixture);
    t.end();
  });
});
