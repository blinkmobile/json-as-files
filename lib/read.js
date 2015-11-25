'use strict';

// foreign modules

const fs = require('graceful-fs');
const json3 = require('json3');

// this module

module.exports = {

  readData (options, callback) {
    const cb = callback || (() => {});
    return new Promise((resolve, reject) => {
      fs.readFile(options.filePath, 'utf8', (err, data) => {
        if (err) {
          cb(err);
          reject(err);
          return;
        }
        let parsed;
        try {
          parsed = json3.parse(data);
        } catch (parseError) {
          cb(parseError);
          reject(parseError);
          return;
        }
        cb(null, parsed);
        resolve(parsed);
      });
    });
  }

};
