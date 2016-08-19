'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const pify = require('pify');
const fsp = pify(require('graceful-fs'));
const temp = pify(require('temp').track());
const test = require('ava');

// local modules

const pkg = require('../package.json');
const writePlan = require('..').writePlan;

// this module

test.beforeEach((t) => {
  return temp.mkdir(`${pkg.name.replace(/\//g, '-')}-`)
    .then((dirPath) => {
      t.context.tempDir = dirPath;
    });
});

test.serial('expected contents', (t) => {
  const ABC_PATH = path.join(t.context.tempDir, 'abc.txt');
  const DEF_PATH = path.join(t.context.tempDir, 'def.json');
  return writePlan({
    plan: [
      { targetPath: ABC_PATH, value: 'abc' },
      { targetPath: DEF_PATH, value: { def: true } }
    ]
  })
    .then(() => fsp.readFile(ABC_PATH, 'utf8').then((value) => t.is(value, 'abc')))
    .then(() => {
      const value = require(DEF_PATH);
      t.deepEqual(value, { def: true });
    });
});

test.serial('non-existant target directory', (t) => {
  const NEW_DIR = path.join(t.context.tempDir, 'new');
  const ABC_PATH = path.join(NEW_DIR, 'abc.txt');
  const DEF_PATH = path.join(NEW_DIR, 'def.json');
  return writePlan({
    plan: [
      { targetPath: ABC_PATH, value: 'abc' },
      { targetPath: DEF_PATH, value: { def: true } }
    ]
  })
    .then(() => fsp.readFile(ABC_PATH, 'utf8').then((value) => t.is(value, 'abc')))
    .then(() => {
      const value = require(DEF_PATH);
      t.deepEqual(value, { def: true });
    });
});
