'use strict';

// foreign modules

const fs = require('graceful-fs');
const json3 = require('json3');

// this module

function fsReadFile (filePath, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, options, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

function jsonParse (string) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = json3.parse(string);
    } catch (err) {
      reject(err);
      return;
    }
    resolve(parsed);
  });
}

function readData (options, callback) {
  const cb = callback || (() => {});
  return fsReadFile(options.filePath, 'utf8')
    .then(jsonParse)
    .then((data) => {
      cb(null, data);
      return Promise.resolve(data); // propagate result to caller
    })
    .catch((err) => {
      cb(err);
      return Promise.reject(err); // propagate error to caller
    });
}

module.exports = {
  fsReadFile,
  jsonParse,
  readData
};
