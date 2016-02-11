'use strict';

// foreign modules

const test = require('ava');

// local modules

const main = require('..');

// this module

test('exports readData() function', (t) => {
  t.is(typeof main.readData, 'function');
});

test('exports writeData() function', (t) => {
  t.is(typeof main.writeData, 'function');
});
