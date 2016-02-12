# Change Log


## 1.1.1


### Fixed

- create missing directories before trying to write files in them


## 1.1.0


### Added

- `writeData()` now accepts a "template" option

    - bypasses reading a pre-existing destination file (if any)

- BC-12: new `planWriteData()` and `writePlan()` functions

    - useful for inspecting and modifying planned writes


### Changed

- drop our own Promise-binding code in favour of [pify](https://github.com/sindresorhus/pify)

- drop [json3](https://github.com/bestiejs/json3) in favour of [load-json-file](https://github.com/sindresorhus/load-json-file) and [write-json-file](https://github.com/sindresorhus/write-json-file)

- trust in [SemVer](http://semver.org/) and be less strict about some dependencies

    - makes sense as this is a library, not a product
