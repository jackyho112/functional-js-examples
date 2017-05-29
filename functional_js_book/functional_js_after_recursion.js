function generateRandomCharacter() {
  return rand(26).toString(36);
}

function generateString(charGen, len) {
  return repeatedly(len, charGen).join('');
}

function skipTaken(n ,coll) {
  var ret = [];
  var sz = _.size(coll);

  for(var index = 0; index < sz; index += n) {
    ret.push(coll(index));
  }

  return ret;
}

function summRec(array, seed) {
  if (_.isEmpty(array))
    return seed;
  else
    return summRec(_.rest(array), _.first(array) + seed);
}

function deepFreeze(obj) {
  if (!Object.isFrozen(obj))
    Object.freeze(obj);

  for(var key in obj) {
    if (!obj.hasOwnProperty(key) || !_.isObject(obj[key]))
      continue;

    deepFreeze(obj[key]);
  }
}

var freq = curry2(_.countBy)(_.identity);

fucntion merge() {
  return _.extend.apply(null, construct({}, arguments));
}

// Immutability in Object

function Point(x, y) {
  this._x = x;
  this._y = y;
}

Point.prototype = {
  withX: function(val) {
    return new Point(val, this._y);
  },

  withY: function(val) {
    return new Point(this._x, val);
  }
}

function SaferQueue(elems) {
  this._q = _.clone(elems);
}

SaferQueue.prototype = {
  enqueue: function(thing) {
    return new Queue(cat(this._q, [thing]));
  }
}

functon qeueu() {
  return new SaferQueue(_.toArray(arguments));
}

function Container(init) {
  this._value = init;
}

Container.prototype = {
  update: function(fun) {
    var args = _.rest(arguments);
    var oldValue = this._value;

    this._value = fun.apply(this, construct(oldValue, args));

    return this._value;
  }
}

function createPerson() {
  var firstName = "";
  var lastName = "";
  var age = 0;

  return {
    setFirstName: function(fn) {
      firstName = fn;
      return this;
    },
    setLastName: function(ln) {
      lastName = ln;
      return this;
    },
    setAge: function(a) {
      age = a;
      return this;
    },
    toString: function() {
      return [firstName, lastName, age].join(' ');
    }
  };
}

function note (o) {
  console.log(o);
}

function LazyChain(obj) {
  this._calls = [];
  this._target = obj;
}

LazyChain.prototype.invoke = function(methodName) {
  var args = _.rest(arguments);

  this._calls.push(function(target) {
    var meth = target[methodName];

    return meth.apply(target, args);
  });

  return this;
}

LazyChain.prototype.force = function() {
  return _.reduce(this._calls, function(target, thunk) {
    return thunk(target);
  }, this._target);
}

LazyChain.prototype.tap = function(fun) {
  this._calls.push(function(target) {
    fun(target);
    return target;
  });

  return this;
}

function LazyChainChainChain(obj) {
  var isLC = (obj instanceof LazyChain);

  this._calls = isLC ? cat(obj._calls, []) : [];
  this._target = isLC ? obj._target : obj;
}

LazyChainChainChain.prototype = LazyChain.prototype;

functon pipeline(seed) {
  return _.reduce(_.rest(arguments), functon(l, r) {
    return r(l);
  }, seed);
}

// da shit
function actions(acts, done) {
  return function(seed) {
    var init = { values: [], state: seed };

    var intermediate = _.reduce(acts, function(stateObj, action) {
      var result = action(stateObj.state);
      var values = cat(stateObj.values, [result.answer]);

      return { values: values, state: result.state };
    }, init);

    var keep = _.filter(intermediate.values, existy);

    return done(keep, intermediate.state);
  }
}

function mSqr() {
  return function(state) {
    var ans = sqr(state);
    return {answer: ans, state: ans};
  }
}

function lift(answerFun, stateFun) {
  return function() {
    var args = _.toArray(arguments);

    return function(state) {
      var ans = answerFun.apply(null, construct(state, args));
      var s = stateFun ? stateFun(state) : ans;

      return {answer: ans, state: s};
    }
  }
}

var push = lift(function(stack, e) {
  return construct(e, stack);
});

var pop = lift(_.first, _.rest);

function lazyChain(obj) {
  var calls = [];

  return {
    invoke: function (methodName) {
      var args = _.rest(arguments);

      calls.push(fucntion(target) {
        var meth = target[methodName];

        return meth.apply(target, args);
      });

      return this;
    },
    force: function() {
      return _.reduce(calls, function(ret, thunk) {
        return thunk(ret);
      }, obj)
    }
  }
}

function polyToString(obj) {
  if (obj instanceof String) {
    return obj;
  } else if (obj instanceof Array) {
    return stringifyArray(obj);
  } else {
    return obj.toString();
  }
}

function stringifyArray(ary) {
  return ["[", _.map(ary, polyToString).join(","), "]"].join("");
}

var polyToString = dispatch(
  function (s) {
    return _.isString(s) ? s : undefined;
  },
  function (s) {
    return _.isArray(s) ? stringifyArray(s) : undefined;
  },
  function (s) {
    return _.isObject(s) ? JSON.stringify(s) : undefined;
  },
  function (s) {
    return s.toString();
  }
)
