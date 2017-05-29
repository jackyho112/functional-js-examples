var script = document.createElement("script");
script.src = "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore.js";
document.body.appendChild(script);

function partial1(fun, arg1) {
  return function() {
    var args = [args].concat(Array.prototype.slice.apply(arguments));
    return fun.apply(fun, args);
  }
}

function partial(fun) {
  var pargs = _.rest(arguments);

  return function() {
    var args = cat(pargs, _.toArray(arguments));
    return fun.apply(fun, args);
  }
}

function myLength(ary) {
  if (ary.length === 0) {
    return 0;
  } else {
    return 1 + myLength(ary.slice(1));
  }
}

function cycle(times, ary) {
  if (times <= 0) {
    return [];
  } else {
    return Array.prototype.concat.apply(ary, cycle(times - 1, ary));
  }
}

[['a', 1], ['b', 2], ['c', 3]]

[['a', 'b', 'c'], [1, 2, 3]]

var influences = [
  ['lisp', 'Smalltalk'],
  ['Lisp', 'Scheme'],
  ['Smalltalk', 'Self'],
  ['Scheme', 'JavaScript'],
  ['Scheme', 'Lua'],
  ['Self', 'Lua'],
  ['Self', 'JavaScript']
]

function nexts(graph, node) {
  if (_.isEmpty(graph)) return [];

  var pair = graph[0];
  var from = pair[0];
  var to   = pair[1];
  var more = graph.slice(1);

  if (from === node) {
    return [to].concat(nexts(more, node));
  } else {
    return nexts(more, node);
  }
}

function depthSearch(graph, nodes, seen) {
  if (nodes.length === 0) return seen.reverse();

  var node = nodes[0];
  var more = nodes.slice(1);

  if (seen.indexOf(node) !== -1) {
    return depthSearch(graph, more, seen);
  } else {
    return depthSearch(graph,
                       Array.prototype.concat.apply(nexts(graph, node), more),
                       [node].concat(seen));
  }
}

function tcLength(ary, n) {
  var l = n ? n : 0;

  if (ary.length === 0) {
    return l;
  } else {
    return tcLength(ary.slice(1), l + 1)
  }
}

function andify () {
  var preds = Array.prototype.slice.apply(arguments);

  return function () {
    var args = Array.prototype.slice.apply(arguments);

    var everything = function(ps) {
      if (ps.length === 0) {
        return true;
      } else {
        return _.every(args, _.first(ps)) && everything(_.rest(ps));
      }
    }

    return everything(preds);
  }
}

function orify () {
  var preds = Array.prototype.slice.apply(arguments);

  return function () {
    var args = Array.prototype.slice.apply(arguments);

    var something = function(ps) {
      if (ps.length === 0) {
        return true;
      } else {
        return _.some(args, _.first(ps)) && something(_.rest(ps));
      }
    }

    return everything(preds);
  }
}

// mutual recursion
function flat (array) {
  if (_.isArray(array)) {
    return Array.prototype.concat.apply([], _.map(array, flat));
  } else {
    return [array];
  }
}

function deepClone(obj) {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }

  var temp = new obj.constructor();
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      temp[key] = deepClone(obj[key]);
    }
  }

  return temp;
}

function visit(mapFun, resultFun, array) {
  if (_.isArray(array)) {
    return resultFun(_.map(array, mapFun));
  } else {
    return resultFun(array);
  }
}

function postDepth(fun, ary) {
  return visit(partial1(postDepth, fun), fun, ary);
}

function preDepth(fun, ary) {
  return visit(partial1(preDepth, fun), fun, fun(ary));
}

function influencedWithStrategy(strategy, lang, graph) {
  var results = [];

  strategy(function(x) {
    if (_.isArray(x) && _.first(x) === lang) {
      result.push(second(x));
    }

    return x;

  }, graph)

  return results;
}

function trampoline(fun) {
  var result = fun.apply(fun, _.rest(arguments));

  while (_.isFunction(result)) {
    result = result()
  }

  return result;
}

function generator(seed, current, step) {
  return {
    head: current(seed),
    tail: function () {
      console.log('forced');
      return generator(step(seed), current, step);
    }
  }
}

function genHead(gen) {
  return gen.head;
}

function genTail(gen) {
  return gen.tail();
}

function genTake(n, gen) {
  var doTake = function(x, g, ret) {
    if (x === 0) {
      return ret;
    } else {
      return partial(doTake, x-1, genTail(g), Array.prototype.concat.apply(ret, genHead(g)));
    }
  }

  return trampoline(doTake, n, gen, []);
}

function asyncGetAny(interval, urls, onsuccess, onfailure) {
  var n = urls.length;

  var looper = function(i) {
    setTimeout(function() {
      if (i >= n) {
        onfailure('failed');
        return;
      }

      $.get(urls[i], onsuccess).
        always(function() {
          console.log("try: " + urls[i])
        }).
        fail(function() {
          looper(i + 1);
        });
    }, interval);
  }

  looper(0);
  return "go";
}
