// Identify dependencies in the fucntion and make them more generic/functional
// for instance

// in this function, the outside dependency/secret input that's not passed in
// is today's date, aka New Date().
function daysThisMonth () {
  var
    date = new Date(), // Get the current date
    y = data.getFullYear(),
    m = date.getMonth(),
    start = new Date(y, m, 1),
    end = new Date(y, m + 1, 1);

  return (end-start)/(1000 * 60 * 60 * 24);
}

function getPersonName(person) {
  return get('name', person)
}

// the above function can be made more reusable by getting rid of the secret input
// and making it a param
function datsInMonth(y, m) {
  var
    start = new Date(y, m - 1, 1)
    end = new Date(y, m, 1);

  return (end - start)/(1000 * 60 * 60 * 24);
}

function get(property, object) {
  return object[property];
}

// another way to go about refactoring this is think maximum testabiltiy

// Separate mutation from calculation
// here it pretty much just means batch all the paint jobs and calculation
// One good reason for doing this: it's more testable


// pure functions are testable, memoizable, portable and parellelizable(can run at any time)

// separate params from functions - close in variables to make new functions
// infinite curry function oh yeah
function curry(fn, params) {
  var
    args = params || [],
    slice = Array.prototype.slice,
    fnParamNum = fn.length;

  return function curriedFn () {
    currentArgs = args.concat(slice.apply(arguments));

    if (fnParamNum > currentArgs.length) {
      return curry(fn, currentArgs);
    } else {
      return fn.apply(null, currentArgs)
    }
  }
}

// Function composition
// compose - pass the result of a function down to another and to another or
// a combination of functions taking one another's output based on one input
// point-free - https://en.wikipedia.org/wiki/Tacit_programming

// think collectively - use reduce, filter and map

// Functional programming review -
// make all function inputs explicit as arguments
// these arguments can be provided over time, not just all at once
// try not to modify outside things
// compose without glue variables

var _Container = function (val) {
  this.val = val;
}

var Container = function (x) {
  return new _Container(x);
}

var _Container.prototype.map = function (f) {
  return Container(f(this.val));
}

Container("flamethrower").map(fucntion(s) { return capitalize(s); })

Container([1,2,3]).map(reverse).map(first)

var map = _.curry(function(f, obj) {
  return obj.map(f);
})

// Functor - an object or data structure you can map over
var _Maybe.prototype.map = function (f) {
  return this.val ? Maybe(f(this.val)) : Maybe(null);
}

var _Maybe = function (val) {
  this.val = val;
}

var Maybe = function (x) {
  return new _Maybe(x);
}

// Either - it's for handling errors - left() for errors and right() for the real values

// IO - store a function instead of a value

// EventStream
var id_s = map(function(e) { return '#' + e.id; }, Bacon.fromEventTarget(document, "click"))

id_s.onValue(function(id) { alert('you clicked' + id); })

// Future
var makeHtml = function (post) { return "<div>" + post.title + "/div" };

var page_f = map(makeHtml, http.get('/post/2'))

page_f.fork(function(err) { throw(err); }
            function(page) {$('#container').html(page) })

// Monads
