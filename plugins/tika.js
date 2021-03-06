/**
 * Module Dependencies
 */

var debug = require('debug')('page-pipe:tika');
var concat = require('concat-stream');
var assign = require('object-assign');
var request = require('request');
var assert = require('assert');

/**
 * Export `tika`
 */

module.exports = Tika;

/**
 * Attach `tika` information
 *
 * @param {Object} options
 */

function Tika(options) {
  options = options || {};
  options.url = options.url;
  assert(options.url, 'Tika requires a configured server url: http://wiki.apache.org/tika/TikaJAXRS');

  function tika(ctx, fn) {
    var opts = {
      url: options.url + '/meta',
      headers: {
        'Accept': 'application/json',
        'Content-Type': ctx.url
      }
    }

    // pipe request of page url to tika server
    request.get(ctx.url).pipe(request.put(opts).on('response', response));

    // response
    function response(res) {
      if (error(res.statusCode)) {
        return fn(new Error(res.statusCode + ': ' + res.statusMessage));
      }

      res.pipe(concat(function(meta) {
        var json = JSON.parse(meta.toString());
        ctx.state = assign(ctx.state, json);
        fn(null, ctx);
      }))
    }
  }

  return tika;
}

/**
 * Check the error statsu
 *
 * @param {Number} status
 * @return {Boolean}
 */

function error(status) {
  var type = status / 100 | 0;
  return 4 == type || 5 == type;
}
