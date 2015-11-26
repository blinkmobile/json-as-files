# json-as-files

convert between files and JSON strings, maintaining certain values as separate files

[![Build Status](https://travis-ci.org/blinkmobile/json-as-files.js.png)](https://travis-ci.org/blinkmobile/json-as-files.js)


## Why?

We have a use case where we wish to serialise JSON data to files,
but certain values within that JSON would be more convenient to keep separate.


## What is this?

This library reads and writes JSON files.
The twist is that it crawls data structures,
looking for values like `{ "$file": "foo.txt" }`.


### "$file" references

File paths referenced by "$file" resolve relative to the original JSON file.


## Usage


### basic examples

```js
const { readData, writeData } = require('@blinkmobile/json-as-files');

readData({ filePath: '/path/to/object.json' })
.then((object) => { /* ... */ });

writeData({ filePath: '/path/to/object.json', data: { /* ... */ } })
.then(() => { /* ... */ });
```


### examples with "$file"

object.json:
```json
{
  "title": "short and sweet",
  "content": { "$file": "content.txt"}
}
```

content.txt
```txt
Too long / inconvenient to include in the primary JSON file.
```

```js
readData({ filePath: '/path/to/object.json' })
.then((data) => {
  console.assert(data.title === 'short and sweet');
  console.assert(data.content === 'Too long / inconvenient to include in the primary JSON file.');
});
```


## API


### readData (options, callback)

- @param {ReadOptions} options
- @param {Function} [callback?]
- @returns {Promise}

#### ReadOptions

- @typedef {Object} ReadOptions
- @property {string} filePath


### writeData (options, callback) (NOT IMPLEMENTED)

- @param {WriteOptions} options
- @param {Function} [callback?]
- @returns {Promise}

#### WriteOptions

- @typedef {Object} WriteOptions
- @property {string} filePath
- @property {\*} data
