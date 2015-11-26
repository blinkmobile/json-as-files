# json-as-files

convert between files and JSON strings, maintaining certain values as separate files

[![npm module](https://img.shields.io/npm/v/@blinkmobile/json-as-files.svg)](https://www.npmjs.com/package/@blinkmobile/json-as-files)
[![Build Status](https://travis-ci.org/blinkmobile/json-as-files.js.png)](https://travis-ci.org/blinkmobile/json-as-files.js)


## Why?

We have a use case where we wish to serialise JSON data to files,
but certain values within that JSON would be more convenient to keep separate.
This project keeps all values in the same JSON file by default,
but allows you to split certain values out into their own files.

For example, if you have Markdown content within a JSON structure,
this project allows you to maintain it as a separate ".md" file.
That way, your editor can help you with Markdown-specific highlighting, etc.


## How?

Just replace a value in your JSON `Object` with a "$file" reference:
`{ "$file": "foo.txt" }`.
Make sure you keep a "foo.txt" file with the desired contents.

During JSON file reads, we find these references,
and replace them with the contents of the referenced file.


## Usage


### basic examples

```js
const { readData, writeData } = require('@blinkmobile/json-as-files');

readData({ filePath: '/path/to/object.json' })
.then((object) => { /* ... */ });

writeData({ filePath: '/path/to/object.json', data: { /* ... */ } })
.then(() => { /* ... */ });
```


### read example with "$file"

object.json:
```json
{
  "title": "short and sweet",
  "content": { "$file": "content.txt"}
}
```

content.txt:
```txt
Too long / inconvenient to include in the primary JSON file.
```

JavaScript:
```js
readData({ filePath: '/path/to/object.json' })
.then((data) => {
  console.assert(data.title === 'short and sweet');
  console.assert(data.content === 'Too long / inconvenient to include in the primary JSON file.');
});
```

### write example with "$file"

object.json (already on disk):
```json
{
  "title": "short and sweet",
  "content": { "$file": "content.txt"}
}
```

content.txt may or may not exist beforehand

JavaScript:
```js
writeData({
  filePath: '/path/to/object.json'
}, {
  title: 'new title',
  content: 'new content'
})
.then(() => {
  // avoid ...Sync() methods in production, please!
  console.assert(fs.existsSync('/path/to/object.json'));
  console.assert(fs.existsSync('/path/to/content.txt'));

  return readData({ filePath: '/path/to/object.json' })
})
.then((data) => {
  console.assert(data.title === 'new title');
  console.assert(data.content === 'new content');
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


### writeData (options, callback)

- @param {WriteOptions} options
- @param {Function} [callback?]
- @returns {Promise}

#### WriteOptions

- @typedef {Object} WriteOptions
- @property {string} filePath
- @property {\*} data
