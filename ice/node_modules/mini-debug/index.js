/**
 * Created by alykoshin on 10.12.15.
 */

var noop = function () {};
var methods = [
  'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
  'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
  'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
  'timeStamp', 'trace', 'warn'
];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  * Prevents errors on console methods when no console present.
//  * Exposes a global 'debug' function that preserves line numbering and formatting.
var _debug = function (obj) {
  var that = {};

  that.obj = obj;

  var method;
  var con;
  if ( typeof window !== 'undefined') {
    window.console = window.console || {};
    con = window.console;
  } else {
    con = console || {};
  }

  if (!con['debug']) { con.debug = con.log; } // IE does not support debug.

  var length = methods.length;
  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if ( ! con[method] ) { // .hasOwnProperty(method) ) { // !con[method] ) {
      con[method] = noop; // Disable for con
      that[method]    = noop; // and for this object too
    } else {
      if (Function.prototype.bind) {
        that[method] = Function.prototype.bind.call(con[method], con, '%s'); // '%s' does not works for group
      } else {
        that[method] = Function.prototype.apply.call(con[method], con, 'xyz',arguments);
      }
    }
  }
  //if(that.obj) {
  //  con.log('>>>>>>>>>>>>', that.obj.debugId, that.obj);
  // }
  //  if (!con.debug) { // IE does not support con.debug
  //    that.debug = Function.prototype.bind.call(con.log,   con, pref + ' **** debug:   %s');;
  //  } else {
  //    that.debug = Function.prototype.bind.call(con.debug, con, pref + ' **** debug: %s');
  //  }

  /** Rewrite specific methods **/
  if (Function.prototype.bind) {
    // con.log('_debug(): if (Function.prototype.bind) ');
    var pref = '[' + ( (that.obj && that.obj.debugId) ? that.obj.debugId : 'null') +']';


    that.error = Function.prototype.bind.call(con.error, con, pref + ' * error: %s');
    that.warn  = Function.prototype.bind.call(con.warn , con, pref + ' ** warn:  %s');
    that.info  = Function.prototype.bind.call(con.info,  con, pref + ' *** info:  %s');
    if (!con.debug) { // IE does not support con.debug
      that.debug = Function.prototype.bind.call(con.log,   con);//pref + ' **** debug:   %s');;
    } else {
      that.debug = Function.prototype.bind.call(con.debug, con);//pref + ' **** debug: %s');
    }
    that.log   = Function.prototype.bind.call(con.log,   con, pref + ' ***** log:   %s');
    //    that.group = Function.prototype.bind.call(con.group, con, '%s');
    that.group = Function.prototype.bind.call(con.log, con, pref + ' GROUP:   %s');
    //    that.groupCollapsed = Function.prototype.bind.call(con.groupCollapsed, con, '%s');
    that.groupCollapsed = Function.prototype.bind.call(con.log, con, pref + ' GROUP: %s');
    //    if (!that.assert) { that.assert = Function.prototype.bind.call(con.error, con, '* assert: %s'); }
    //  } else {
    //    that.error = function() { Function.prototype.apply.call(con.error, con, arguments); };
    //    that.warn  = function() { Function.prototype.apply.call(con.warn , con, arguments); };
    //    that.info  = function() { Function.prototype.apply.call(con.info,  con, arguments); };
    //    that.debug = function() { Function.prototype.apply.call(con.debug, con, arguments); };
    //    that.log   = function() { Function.prototype.apply.call(con.log,   con, arguments); };
  }

  return that;
};
function _no_debug() {
  var that = {};

  var length = methods.length;
  while (length--) {
    var method = methods[length];
    that[method] = noop;
  }
  return that;
}
//var debug = _no_debug();
var debugObj = _debug();
//var debug = console;

var assert     = function(condition, message) {
  if (!condition) {
    throw message ? 'Assertion failed: \'' + message +'\'': 'Assertion failed.';
  }
};
//var assert = debug.assert;

//assert(false, 'test-message');

//window.console = null;


////////////////////////////////////////////////////////////////////////////////

if (typeof module !== 'undefined') {
  var exports = debugObj;
  //exports.debug = debugObj;
  exports.assert = assert;

  module.exports = exports;
}

if (typeof window !== 'undefined') {
  window.debug = debugObj;
  window.assert  = assert;
}
