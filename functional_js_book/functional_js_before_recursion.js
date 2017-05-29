// First taste of functional programming

function splat(fun) {
  return function(array) {
    return fun.apply(null, array);
  };
}

function unsplat(fun) {
  return function() {
    return fun.call(null, _.toArray(arguments));
  }
}

function fail(thing) {
  throw new Error(thing);
}

function warn(thing) {
  console.log(["WARNING:", thing].join(' '))
}

function note(thing) {
  console.log(["NOTE:", thing].join(' '))
}

// object-oriented programming breaks a software down into many objects which
// interact with each other to run the program, while functional programming
// builds up the software with little actions/functions by taking a value
// through a stream of transformation to get the result

// object-oriented programming is based on chaning states in different objects
// in a predictable manner, but bad design and project size problems will eventually
// blow these state changes out of proportion, hence making the entire software
// confusing and hard to keep track of in terms of its operations

// functional programming strives to minimzie state changes. It's basically breaking
// down imperative programming into smaller independant operations or units of
// abstraction and then isolate state changes or mutation as much as possible.

function isIndexed(data) {
  return _.isArray(data) || _.isString(data);
}

function nth (a, index) {
  if (!_.isNumber(index)) fail('Expected a number as the index');

  if (!isIndexed(a)) fail('Not supported on non-indexed type');

  if ((index < 0) || (index > a.length - 1)) fail('Index value is out of bounds');

  return a[index];
}

function second(a) {
  return nth(a, 1);
}

// Functions that always return a Boolean value are called predicates
// Example:

function lessOrEqual(x, y) {
  return x < y;
}

function truthy(x) {
  return existy(x) && (x !== false);
}

function comparator(pred) {
  return function(x, y) {
    if (truthy(pred(x, y)))
      return -1;
    else if (truthy(pred(y, x)))
      return 1;
    else
      return 0;
  }
}

[2, 3, -1, -6, 0, -108, 42, 10].sort(comparator(lessOrEqual))

// A high-order function is a function that takes another function and returns a new function

[
  ['name', 'age', 'hair'],
  ['Merble', '35', 'red'],
  ['Bob', '64', 'blonde']
]


function lameCSV(str) {
  return _.reduce(
    str.split("\n"),
    function(table, row) {
      table.push(
        _.map(
          row.split(','),
          function(c) { return c.trim(); }
        )
      );
      return table;
    },
    []
  )
}

function selectNames(table) {
  return _.rest(_.map(table, _first));
}

function selectAges(table) {
  return_.rest(_.map(table, second));
}

function selectHairColor(table) {
  return _.rest(_.map(table, function(row){
    return nth(row, 2);
  }))
}

function existy(x) {
  return x != null;
}

function cat() {
  var head = _.first(arguments);

  if (existy(head))
    return head.concat.apply(head, _.rest(arguments));
  else
    return [];
}

function construct(head, tail) {
  return cat([head], _.toArray(tail));
}

function mapcat(fun, coll) {
  return cat.apply(null, _.map(coll, fun));
}

// table manipulation - arrays of objs
function project(table, keys) {
  return _.map(table, function (obj) {
    return _.pick.apply(null, construct(obj, keys));
  })
}

function rename(obj, newNames) {
  return _.reduce(
    newNames,
    function(newObj, newKey, oldKey) {
      debugger
      if (!_.has(newObj, oldKey)) {
        newObj[newKey] = obj[oldKey];
        return newObj;
      } else {
        return newObj;
      }
    },
    _.omit.apply(null, construct(obj, _.keys(newNames)))
  );
}

function as(table, newNames) {
  return _.map(table, function (obj) {
    return rename(obj, newNames);
  });
}

// Reminder: Functions that always return a Boolean value are called predicates
function restrict(table, pred) {
  return _.reduce(
    table,
    function(newTable, obj) {
      if (truthy(pred(obj)))
        return newTable;
      else
        return _.without(newTable, obj);
    },
    table
  )
}

function plucker(field) {
  return function(obj) {
    return (obj && obj[field]);
  }
}

function finder(valueFun, betterFun, collection) {
  return _.reduce(collection, function(best, current) {
    var currentBestValue = valueFun(best);
    var currentValue = valueFun(current);
    var betterValue = betterFun(currentBestValue, currentValue);

    return (betterValue === currentBestValue ? currentBestValue : currentValue);
  });
}

// simplified from finder
function best(compareFun, collection) {
  return _.reduce(collection, function (a, b) {
    return (compareFun(a, b) ? a : b);
  });
}

function repeatedly(times, fun) {
  return _.map(_.range(times), function (num) {
    return fun(time);
  });
}

// Use functionsm, not values
function iterateUntil(fun, check, init) {
  var collection = [];
  var result = fun(init);

  while(check(result)) {
    collection.push(result);
    result = fun(result);
  }

  return collection;
}

function always(value) {
  return function () {
    return value;
  };
}

function doWhen (cond, action) {
  if (truthy(cond)) {
    return action();
  } else {
    return undefined;
  }
}

function makeAdder(a) {
  return function(b) {
    return a + b;
  };
}

function invoker (name, method) {
  return function(target) {
    if (!existy(target)) fail("Must provide a target");

    var targetMethod = target[name];
    var args = _.rest(arguments);

    return doWhen(existy(targetMethod) && method === targetMethod, function () {
      return targetMethod.apply(target, args);
    });
  }
}

// Capture variables

// set defaults
function fnull (fun) {
  var defaults = _.rest(arguments);

  return function() {
    var args = _.map(arguments, function(value, index) {
      return (existy(value) ? value : defaults[index]);
    });

    return fun.apply(null , args);
  }
}

function defaults(defaultVals) {
  return function(object, key) {
    var val = fnull(_.identity, defaultVals[key]);

    return object && val(object[key]);
  }
}

// Object validation
function checker () {
  var validators = _.toArray(arguments);

  return function (obj) {
    return _.reduce(validators, function(errs, check) {
      if (check(obj)) {
        return errs;
      } else {
        return _.chains(errs).push(check.message).value();
      };
    }, [])
  }
}

function createValidator (message, fun) {
  var f = function () {
    return fun.apply(fun, arguments);
  }

  f['message'] = message;

  return f;
}

function aMap(object) {
  return _.isObject(object);
}

function hasKeys () {
  var keys = _.toArray(arguments);

  var fun = function (obj) {
    return _.every(keys, function(k) {
      return _.has(obj, k);
    });
  }

  fun.message = cat(['Must have values for keys:'], keys).join(' ');

  return fun;
}

var checkCommand = checker(createValidator('must be a map', aMap), hasKeys('msg', 'type'));

// Composition
function dispatch () {
  var
    funs = _.toArray(arguments),
    size = funs.length;

  return function(target) {
    var
      ret,
      args = _.rest(arguments);

    for (var funIndex = 0; funIndex < size; funIndex++) {
      var fun = funs[funIndex];
      ret = fun.apply(fun, construct(target, args));

      if (existy(ret)) return ret;
    }

    return ret;
  };
}

function stringReverse(s) {
  if (!_.isString(s)) return undefined;

  return s.split('').reverse().join('');
}

function isa(type, action) {
  return function(obj) {
    if (type === obj.type) {
      return action(obj);
    }
  }
}

// Currying - returning configured functions
function rightAwayInvoker () {
  var args = _.toArray(arguments);
  var method = args.shift();
  var target = args.shift();

  return method.apply(target, args);
}

function currySupreme(fn, params) {
  var
    args = params || [],
    fnParamNum = fn.length;

  return function curriedFn (arg, options) {
    var
      currentArgs = args.push(arg),
      options = options || {};

    if (options.reverse === true) {
      currentArgs = currentArgs.reverse;
    }

    if (fnParamNum > currentArgs.length && options.instantCall !== true) {
      return curry(fn, currentArgs);
    } else {
      return fn.apply(null, currentArgs)
    }
  }
}

function leftCurryDiv(n) {
  return function(d) {
    return n/d;
  }
}

function rightCurryDiv(d) {
  return function(n) {
    return n/d;
  }
}

function curry(fun) {
  return function(arg) {
    return fun(arg);
  }
}

function curry2(fun) {
  return function(secondArg) {
    return function(firstArg) {
      return fun(firstArg, secondArg);
    }
  }
}

// random examples
function songToString(song) {
  return [song.artist, song.track].join(" - ");
}
var songCount = curry2(_.countBy, songToString);

function curry3(fun) {
  return function(last) {
    return function(middle) {
      return function (first) {
        return fun(first, middle, last);
      }
    }
  }
}

function partial1(fun, arg1) {
  return function () {
    var args = construct(arg1, arguments);
    return fun.apply(fun, args);
  }
}

function partial2(fun, arg1, arg2) {
  return function () {
    var args = cat([args, args], arguments);

    return fun.apply(fun, args);
  }
}

function partial(fun) {
  var pargs = _.rest(arguments);

  return function () {
    var args = cat(pargs, _.toArray(arguments));

    return fun.apply(fun, args);
  }
}

function complement(pred) {
  return function() {
    return !pred.apply(null, _.toArray(arguments));
  }
}

function condition1 () {
  var validators = _.toArray(arguments);

  return function(fun, arg) {
    var errors = mapcat(function (isValid) {
      return isValid(arg) ? [] : [isValid.message];
    }, validators);

    if (!_.isEmpty(errors)) throw new Error(errors.join(", "));

    return fun(arg);
  }
}
