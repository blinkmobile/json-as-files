'use strict';

const fsp = require('@jokeyrhyme/pify-fs');

function assertFileNotExists (t, filePath) {
  // Node >=6.3 uses fs.constants.F_OK, <6.3 uses fs.F_OK
  return fsp.access(filePath, (fsp.constants || fsp).F_OK)
    .then(() => t.fail(`${filePath} should not exist`))
    .catch(() => t.pass(`${filePath} does not exist`));
}

module.exports = {
  assertFileNotExists
};
