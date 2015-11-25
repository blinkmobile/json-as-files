# json-as-files

convert between files and JSON strings, maintaining certain values as separate files

[![Build Status](https://travis-ci.org/blinkmobile/json-as-files.js.png)](https://travis-ci.org/blinkmobile/json-as-files.js)


## Usage

```js
const { readData, writeData } = require('@blinkmobile/json-as-files');

readData({ filePath: '/path/to/object.json' })
.then((object) => { /* ... */ });

writeData({ filePath: '/path/to/object.json', data: { /* ... */ })
.then(() => { /* ... */ });
```

### readData (options, callback)

- @param {ReadOptions} options
- @param {Function} [callback?]
- @returns {Promise}

#### ReadOptions

- @typedef {Object} ReadOptions
- @property {string} filePath


### writeData (options, callback)

- @param {WriteOptions} options
- @param {Function} [callback?]
- @returns {Promise}

#### WriteOptions

- @typedef {Object} WriteOptions
- @property {string} filePath
- @property {\*} data
