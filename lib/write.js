'use strict';

// foreign modules

const fs = require('graceful-fs');
const json3 = require('json3');

// this module

function fsWriteFile (filePath, contents, options) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, contents, options, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

function jsonStringify (value) {
  return new Promise((resolve, reject) => {
    let string;
    try {
      string = json3.stringify(value, null, 2);
    } catch (err) {
      reject(err);
      return;
    }
    resolve(string);
  });
}

function writeData (options) {
  return jsonStringify(options.data)
    .then((string) => {
      return fsWriteFile(options.filePath, string, 'utf8');
    });
}

module.exports = {

  fsWriteFile,
  jsonStringify,

  writeData (options, callback) {
    const cb = callback || (() => {});
    return writeData(options)
      .then(() => {
        cb(null);
        return Promise.resolve(); // propagate result to caller
      })
      .catch((err) => {
        cb(err);
        return Promise.reject(err); // propagate error to caller
      });
  }

};
