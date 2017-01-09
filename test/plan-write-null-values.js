'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const test = require('ava');

// local modules

const fsHelpers = require('./helpers/fs.js');
const planWriteData = require('..').planWriteData;

// this module

const TARGET_FILE_PATH = path.join(__dirname, 'fixtures', 'foo.json');

test(`${TARGET_FILE_PATH} does not exist`, (t) => {
  // Node >=6.3 uses fs.constants.F_OK, <6.3 uses fs.F_OK
  return fsHelpers.assertFileNotExists(t, TARGET_FILE_PATH);
});

test('template with "$file" + data with null values', (t) => {
  const data = {
    value: null
  };
  const template = {
    value: {
      $file: 'value.txt'
    }
  };
  return planWriteData({ data, filePath: TARGET_FILE_PATH, template })
    .then((result) => {
      t.is(result.length, 1);
      t.deepEqual(result[0], {
        targetPath: TARGET_FILE_PATH,
        value: data
      });
    });
});
