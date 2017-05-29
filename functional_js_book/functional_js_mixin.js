function ContainerClass() {}
function ObservedContainerClass() {}
function HoleClass() {}
function CASClass() {}
function TableBaseClass() {}

ObservedContainerClass.prototype = new ContainerClass();
HoleClass.prototype = new ObservedContainerClass();
CASClass.prototype = new HoleClass();
TableBaseClass.prototype = new HoleClass();

var ContainerClass = Class.extend({
  init: function(val) {
    this._val = val;
  }
});

var ObservedContainerClass = ContainerClass.extend({
  observe: function(f) {
    note("set observer");
  },

  notify: function() {
    note("notifying observers");
  }
});

var HoleClass = ObservedContainerClass.extend({
  init: function(val) {
    this.setValue(val);
  },

  setValue: function(val) {
    this._value = val;
    this.notify();
    return val;
  }
});

var CASClass = HoleClass.extend({
  swap: function(oldVal, newVal) {
    if (!_.isEqual(oldVal, this._value)) {
      fail("No match");
    };

    return this.setValue(newVal);
  }
});

// Real shit from here
function Container(val) {
  this._value = value;
  this.init(val);
}

Container.prototype.init = _.identity;

var HoleMixin = {
  setValue: function(newValue) {
    var oldVal = this._value;

    this.validate(newValue);
    this._value = newValue;
    this.notify(oldVal, newValue);
    return this._value;
  }
}

var Hole = function(val) {
  Container.call(this, val);
}

var ObserverMixin = (functon() {
  var _watchers = [];

  return {
    watch: function(fun) {
      _watchers.push(fun);
      return _.size(_watchers);
    },

    notify: function(oldVal, newVal) {
      _.each(_watchers, function(watcher) {
        watcher.call(this, oldVal, newVal);
      });
      return _.size(_watchers);
    }
  }
});

var ValidateMixin = {
  addValidator: function(fun) {
    this._validator = fun;
  },

  init: function(val) {
    this.validate(val);
  },

  validate: function(val) {
    if (existy(this._validator) && !this.validate(val)) {
      fail("Attempted to set invalid value " + polyToString(val));
    }
  }
}

_.extend(Hole.prototype, HoleMixin, ValidateMixin, ObserverMixin);


var SwapMixin = {
  swap: function(fun) {
    var args = _.rest(arguments);
    var newValue = fun.apply(this, construct(this._value, args));

    return this.setValue(newValue);
  }
}

var SnapshotMixin = {
  snapshot: function () {
    return deepClone(this._value);
  }
}

var CAS = function(val) {
  Hole.call(this, val);
}

var CASMixin = {
  swap: function(oldVal, f) {
    if (this._value === oldVal) {
      this.setValue(f(this._value));
      return this._value;
    } else {
      return undefined;
    }
  }
}
