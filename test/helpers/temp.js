'use strict';

const path = require('path');

const fsp = require('@jokeyrhyme/pify-fs');
const pify = require('pify');
const temp = pify(require('temp').track());

const pkg = require('../../package.json');

const TEMP_PREFIX = pkg.name.replace(/\//g, '-') + '-';

function makeContextTempDir (t) {
  return temp.mkdir(TEMP_PREFIX)
    .then((dirPath) => {
      t.context.tempDir = dirPath;
    });
}

function makeContextTempDirWithFixture (t, fixture) {
  const fixturePath = path.join(__dirname, '..', 'fixtures', fixture);
  return makeContextTempDir(t)
    .then(() => fsp.readFile(fixturePath, 'utf8'))
    .then((contents) => {
      const tempFixturePath = path.join(t.context.tempDir, fixture);
      return fsp.writeFile(tempFixturePath, contents, 'utf8');
    });
}

module.exports = {
  makeContextTempDir,
  makeContextTempDirWithFixture
};
