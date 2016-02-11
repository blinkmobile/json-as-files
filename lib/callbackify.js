'use strict';

/**
@param {Function} fn Promise-returning functions with exactly 1 parameter
@returns {Function} callback-style function
*/
function callbackify (fn) {
  return (arg, callback) => {
    const cb = callback || (() => {});
    return fn(arg)
      .then((result) => {
        cb(null, result);
        return Promise.resolve(result); // propagate result to caller
      })
      .catch((err) => {
        cb(err);
        return Promise.reject(err); // propagate error to caller
      });
  };
}

module.exports = { callbackify };
