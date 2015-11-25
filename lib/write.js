'use strict';

// foreign modules

const fs = require('graceful-fs');
const json3 = require('json3');

// this module

module.exports = {

  writeData (options, callback) {
    const cb = callback || (() => {});
    return new Promise((resolve, reject) => {
      let string;
      try {
        string = json3.stringify(options.data, null, 2);
      } catch (err) {
        cb(err);
        reject(err);
        return;
      }
      fs.writeFile(options.filePath, string, 'utf8', (err) => {
        if (err) {
          cb(err);
          reject(err);
          return;
        }
        cb(null);
        resolve();
      });
    });
  }

};
