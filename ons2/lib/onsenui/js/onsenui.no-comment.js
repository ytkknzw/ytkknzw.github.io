
if (!window.CustomEvent) {
  (function() {
    var CustomEvent;

    CustomEvent = function(event, params) {
      var evt;
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
  })();
}

if (typeof WeakMap === "undefined") {
  (function() {
    var defineProperty = Object.defineProperty;
    var counter = Date.now() % 1e9;
    var WeakMap = function() {
      this.name = "__st" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");
    };
    WeakMap.prototype = {
      set: function(key, value) {
        var entry = key[this.name];
        if (entry && entry[0] === key) entry[1] = value; else defineProperty(key, this.name, {
          value: [ key, value ],
          writable: true
        });
        return this;
      },
      get: function(key) {
        var entry;
        return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;
      },
      "delete": function(key) {
        var entry = key[this.name];
        if (!entry || entry[0] !== key) return false;
        entry[0] = entry[1] = undefined;
        return true;
      },
      has: function(key) {
        var entry = key[this.name];
        if (!entry) return false;
        return entry[0] === key;
      }
    };
    window.WeakMap = WeakMap;
  })();
}

(function(global) {
  if (global.JsMutationObserver) {
    return;
  }
  var registrationsTable = new WeakMap();
  var setImmediate;
  if (/Trident|Edge/.test(navigator.userAgent)) {
    setImmediate = setTimeout;
  } else if (window.setImmediate) {
    setImmediate = window.setImmediate;
  } else {
    var setImmediateQueue = [];
    var sentinel = String(Math.random());
    window.addEventListener("message", function(e) {
      if (e.data === sentinel) {
        var queue = setImmediateQueue;
        setImmediateQueue = [];
        queue.forEach(function(func) {
          func();
        });
      }
    });
    setImmediate = function(func) {
      setImmediateQueue.push(func);
      window.postMessage(sentinel, "*");
    };
  }
  var isScheduled = false;
  var scheduledObservers = [];
  function scheduleCallback(observer) {
    scheduledObservers.push(observer);
    if (!isScheduled) {
      isScheduled = true;
      setImmediate(dispatchCallbacks);
    }
  }
  function wrapIfNeeded(node) {
    return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
  }
  function dispatchCallbacks() {
    isScheduled = false;
    var observers = scheduledObservers;
    scheduledObservers = [];
    observers.sort(function(o1, o2) {
      return o1.uid_ - o2.uid_;
    });
    var anyNonEmpty = false;
    observers.forEach(function(observer) {
      var queue = observer.takeRecords();
      removeTransientObserversFor(observer);
      if (queue.length) {
        observer.callback_(queue, observer);
        anyNonEmpty = true;
      }
    });
    if (anyNonEmpty) dispatchCallbacks();
  }
  function removeTransientObserversFor(observer) {
    observer.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      if (!registrations) return;
      registrations.forEach(function(registration) {
        if (registration.observer === observer) registration.removeTransientObservers();
      });
    });
  }
  function forEachAncestorAndObserverEnqueueRecord(target, callback) {
    for (var node = target; node; node = node.parentNode) {
      var registrations = registrationsTable.get(node);
      if (registrations) {
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;
          if (node !== target && !options.subtree) continue;
          var record = callback(options);
          if (record) registration.enqueue(record);
        }
      }
    }
  }
  var uidCounter = 0;
  function JsMutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;
  }
  JsMutationObserver.prototype = {
    observe: function(target, options) {
      target = wrapIfNeeded(target);
      if (!options.childList && !options.attributes && !options.characterData || 
        options.attributeOldValue && !options.attributes || 
        options.attributeFilter && options.attributeFilter.length && !options.attributes || 
        options.characterDataOldValue && !options.characterData) {
        throw new SyntaxError();
      }
      var registrations = registrationsTable.get(target);
      if (!registrations) registrationsTable.set(target, registrations = []);
      var registration;
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          registration.removeListeners();
          registration.options = options;
          break;
        }
      }
      if (!registration) {
        registration = new Registration(this, target, options);
        registrations.push(registration);
        this.nodes_.push(target);
      }
      registration.addListeners();
    },
    disconnect: function() {
      this.nodes_.forEach(function(node) {
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.observer === this) {
            registration.removeListeners();
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
      this.records_ = [];
    },
    takeRecords: function() {
      var copyOfRecords = this.records_;
      this.records_ = [];
      return copyOfRecords;
    }
  };
  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = [];
    this.removedNodes = [];
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }
  function copyMutationRecord(original) {
    var record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  }
  var currentRecord, recordWithOldValue;
  function getRecord(type, target) {
    return currentRecord = new MutationRecord(type, target);
  }
  function getRecordWithOldValue(oldValue) {
    if (recordWithOldValue) return recordWithOldValue;
    recordWithOldValue = copyMutationRecord(currentRecord);
    recordWithOldValue.oldValue = oldValue;
    return recordWithOldValue;
  }
  function clearRecords() {
    currentRecord = recordWithOldValue = undefined;
  }
  function recordRepresentsCurrentMutation(record) {
    return record === recordWithOldValue || record === currentRecord;
  }
  function selectRecord(lastRecord, newRecord) {
    if (lastRecord === newRecord) return lastRecord;
    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) return recordWithOldValue;
    return null;
  }
  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }
  Registration.prototype = {
    enqueue: function(record) {
      var records = this.observer.records_;
      var length = records.length;
      if (records.length > 0) {
        var lastRecord = records[length - 1];
        var recordToReplaceLast = selectRecord(lastRecord, record);
        if (recordToReplaceLast) {
          records[length - 1] = recordToReplaceLast;
          return;
        }
      } else {
        scheduleCallback(this.observer);
      }
      records[length] = record;
    },
    addListeners: function() {
      this.addListeners_(this.target);
    },
    addListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.addEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.addEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);
    },
    removeListeners: function() {
      this.removeListeners_(this.target);
    },
    removeListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);
    },
    addTransientObserver: function(node) {
      if (node === this.target) return;
      this.addListeners_(node);
      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations) registrationsTable.set(node, registrations = []);
      registrations.push(this);
    },
    removeTransientObservers: function() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];
      transientObservedNodes.forEach(function(node) {
        this.removeListeners_(node);
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i] === this) {
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
    },
    handleEvent: function(e) {
      e.stopImmediatePropagation();
      switch (e.type) {
       case "DOMAttrModified":
        var name = e.attrName;
        var namespace = e.relatedNode.namespaceURI;
        var target = e.target;
        var record = new getRecord("attributes", target);
        record.attributeName = name;
        record.attributeNamespace = namespace;
        var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.attributes) return;
          if (options.attributeFilter && options.attributeFilter.length && 
            options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
            return;
          }
          if (options.attributeOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMCharacterDataModified":
        var target = e.target;
        var record = getRecord("characterData", target);
        var oldValue = e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.characterData) return;
          if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMNodeRemoved":
        this.addTransientObserver(e.target);

       case "DOMNodeInserted":
        var changedNode = e.target;
        var addedNodes, removedNodes;
        if (e.type === "DOMNodeInserted") {
          addedNodes = [ changedNode ];
          removedNodes = [];
        } else {
          addedNodes = [];
          removedNodes = [ changedNode ];
        }
        var previousSibling = changedNode.previousSibling;
        var nextSibling = changedNode.nextSibling;
        var record = getRecord("childList", e.target.parentNode);
        record.addedNodes = addedNodes;
        record.removedNodes = removedNodes;
        record.previousSibling = previousSibling;
        record.nextSibling = nextSibling;
        forEachAncestorAndObserverEnqueueRecord(e.relatedNode, function(options) {
          if (!options.childList) return;
          return record;
        });
      }
      clearRecords();
    }
  };
  global.JsMutationObserver = JsMutationObserver;
  if (!global.MutationObserver) {
    global.MutationObserver = JsMutationObserver;
    JsMutationObserver._isPolyfilled = true;
  }
})(self);

window.animit = (function(){
  'use strict';

  var TIMEOUT_RATIO = 1.4;

  var util = {
  };

  util.capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  util.buildTransitionValue = function(params) {
    params.property = params.property || 'all';
    params.duration = params.duration || 0.4;
    params.timing = params.timing || 'linear';

    var props = params.property.split(/ +/);

    return props.map(function(prop) {
      return prop + ' ' + params.duration + 's ' + params.timing;
    }).join(', ');
  };

  util.onceOnTransitionEnd = function(element, callback) {
    if (!element) {
      return function() {};
    }

    var fn = function(event) {
      if (element == event.target) {
        event.stopPropagation();
        removeListeners();

        callback();
      }
    };

    var removeListeners = function() {
      util._transitionEndEvents.forEach(function(eventName) {
        element.removeEventListener(eventName, fn, false);
      });
    };

    util._transitionEndEvents.forEach(function(eventName) {
      element.addEventListener(eventName, fn, false);
    });

    return removeListeners;
  };

  util._transitionEndEvents = (function() {
    if ('ontransitionend' in window) {
      return ['transitionend'];
    }

    if ('onwebkittransitionend' in window) {
      return ['webkitTransitionEnd'];
    }

    if (util.vendorPrefix === 'webkit' || util.vendorPrefix === 'o' || util.vendorPrefix === 'moz' || util.vendorPrefix === 'ms') {
      return [util.vendorPrefix + 'TransitionEnd', 'transitionend'];
    }

    return [];
  })();

  util._cssPropertyDict = (function() {
    var styles = window.getComputedStyle(document.documentElement, '');
    var dict = {};
    var a = 'A'.charCodeAt(0);
    var z = 'z'.charCodeAt(0);

    var upper = function(s) {
      return s.substr(1).toUpperCase();
    };

    for (var i = 0; i < styles.length; i++) {
      var key = styles[i]
        .replace(/^[\-]+/, '')
        .replace(/[\-][a-z]/g, upper)
        .replace(/^moz/, 'Moz');

      if (a <= key.charCodeAt(0) && z >= key.charCodeAt(0)) {
        if (key !== 'cssText' && key !== 'parentText') {
          dict[key] = true;
        }
      }
    }

    return dict;
  })();

  util.hasCssProperty = function(name) {
    return name in util._cssPropertyDict;
  };

  util.vendorPrefix = (function() {
    var styles = window.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice
      .call(styles)
      .join('')
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1];
    return pre;
  })();

  util.forceLayoutAtOnce = function(elements, callback) {
    this.batchImmediate(function() {
      elements.forEach(function(element) {
        element.offsetHeight;
      });
      callback();
    });
  };

  util.batchImmediate = (function() {
    var callbacks = [];

    return function(callback) {
      if (callbacks.length === 0) {
        setImmediate(function() {
          var concreateCallbacks = callbacks.slice(0);
          callbacks = [];
          concreateCallbacks.forEach(function(callback) {
            callback();
          });
        });
      }

      callbacks.push(callback);
    };
  })();

  util.batchAnimationFrame = (function() {
    var callbacks = [];

    var raf = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      setTimeout(callback, 1000 / 60);
    };

    return function(callback) {
      if (callbacks.length === 0) {
        raf(function() {
          var concreateCallbacks = callbacks.slice(0);
          callbacks = [];
          concreateCallbacks.forEach(function(callback) {
            callback();
          });
        });
      }

      callbacks.push(callback);
    };
  })();

  util.transitionPropertyName = (function() {
    if (util.hasCssProperty('transitionDuration')) {
      return 'transition';
    }

    if (util.hasCssProperty(util.vendorPrefix + 'TransitionDuration')) {
      return util.vendorPrefix + 'Transition';
    }

    throw new Error('Invalid state');
  })();

  var Animit = function(element) {
    if (!(this instanceof Animit)) {
      return new Animit(element);
    }

    if (element instanceof HTMLElement) {
      this.elements = [element];
    } else if (Object.prototype.toString.call(element) === '[object Array]') {
      this.elements = element;
    } else {
      throw new Error('First argument must be an array or an instance of HTMLElement.');
    }

    this.transitionQueue = [];
    this.lastStyleAttributeDict = [];
  };

  Animit.prototype = {
    transitionQueue: undefined,

    elements: undefined,

    play: function(callback) {
      if (typeof callback === 'function') {
        this.transitionQueue.push(function(done) {
          callback();
          done();
        });
      }

      this.startAnimation();

      return this;
    },

    queue: function(transition, options) {
      var queue = this.transitionQueue;

      if (transition && options) {
        options.css = transition;
        transition = new Animit.Transition(options);
      }

      if (!(transition instanceof Function || transition instanceof Animit.Transition)) {
        if (transition.css) {
          transition = new Animit.Transition(transition);
        } else {
          transition = new Animit.Transition({
            css: transition
          });
        }
      }

      if (transition instanceof Function) {
        queue.push(transition);
      } else if (transition instanceof Animit.Transition) {
        queue.push(transition.build());
      } else {
        throw new Error('Invalid arguments');
      }

      return this;
    },

    wait: function(seconds) {
      if (seconds > 0) {
        this.transitionQueue.push(function(done) {
          setTimeout(done, 1000 * seconds);
        });
      }

      return this;
    },

    saveStyle: function() {
      this.transitionQueue.push(function(done) {
        this.elements.forEach(function(element, index) {
          var css = this.lastStyleAttributeDict[index] = {};

          for (var i = 0; i < element.style.length; i++) {
            css[element.style[i]] = element.style[element.style[i]];
          }
        }.bind(this));
        done();
      }.bind(this));

      return this;
    },

    restoreStyle: function(options) {
      options = options || {};
      var self = this;

      if (options.transition && !options.duration) {
        throw new Error('"options.duration" is required when "options.transition" is enabled.');
      }

      var transitionName = util.transitionPropertyName;

      if (options.transition || (options.duration && options.duration > 0)) {
        var transitionValue = options.transition || ('all ' + options.duration + 's ' + (options.timing || 'linear'));

        this.transitionQueue.push(function(done) {
          var elements = this.elements;
          var timeoutId;

          var clearTransition = function() {
            elements.forEach(function(element) {
              element.style[transitionName] = '';
            });
          };

          var removeListeners = util.onceOnTransitionEnd(elements[0], function() {
            clearTimeout(timeoutId);
            clearTransition();
            done();
          });

          timeoutId = setTimeout(function() {
            removeListeners();
            clearTransition();
            done();
          }, options.duration * 1000 * TIMEOUT_RATIO);

          elements.forEach(function(element, index) {
            var css = self.lastStyleAttributeDict[index];

            if (!css) {
              throw new Error('restoreStyle(): The style is not saved. Invoke saveStyle() before.');
            }

            self.lastStyleAttributeDict[index] = undefined;

            var name;
            for (var i = 0, len = element.style.length; i < len; i++) {
              name = element.style[i];
              if (css[name] === undefined) {
                css[name] = '';
              }
            }

            element.style[transitionName] = transitionValue;

            Object.keys(css).forEach(function(key) {
              if (key !== transitionName) {
                element.style[key] = css[key];
              }
            });

            element.style[transitionName] = transitionValue;
          });
        });
      } else {
        this.transitionQueue.push(function(done) {
          reset();
          done();
        });
      }

      return this;

      function reset() {
        self.elements.forEach(function(element, index) {
          element.style[transitionName] = 'none';

          var css = self.lastStyleAttributeDict[index];

          if (!css) {
            throw new Error('restoreStyle(): The style is not saved. Invoke saveStyle() before.');
          }

          self.lastStyleAttributeDict[index] = undefined;

          for (var i = 0, name = ''; i < element.style.length; i++) {
            name = element.style[i];
            if (typeof css[element.style[i]] === 'undefined') {
              css[element.style[i]] = '';
            }
          }

          Object.keys(css).forEach(function(key) {
            element.style[key] = css[key];
          });

        });
      }
    },

    startAnimation: function() {
      this._dequeueTransition();

      return this;
    },

    _dequeueTransition: function() {
      var transition = this.transitionQueue.shift();
      if (this._currentTransition) {
        throw new Error('Current transition exists.');
      }
      this._currentTransition = transition;
      var self = this;
      var called = false;

      var done = function() {
        if (!called) {
          called = true;
          self._currentTransition = undefined;
          self._dequeueTransition();
        } else {
          throw new Error('Invalid state: This callback is called twice.');
        }
      };

      if (transition) {
        transition.call(this, done);
      }
    }
  };

  Animit.runAll = function() {
    for (var i = 0; i < arguments.length; i++) {
      arguments[i].play();
    }
  };

  Animit.Transition = function(options) {
    this.options = options || {};
    this.options.duration = this.options.duration || 0;
    this.options.timing = this.options.timing || 'linear';
    this.options.css = this.options.css || {};
    this.options.property = this.options.property || 'all';
  };

  Animit.Transition.prototype = {
    build: function() {
      if (Object.keys(this.options.css).length === 0) {
        throw new Error('options.css is required.');
      }

      var css = createActualCssProps(this.options.css);

      if (this.options.duration > 0) {
        var transitionValue = util.buildTransitionValue(this.options);
        var self = this;

        return function(callback) {
          var elements = this.elements;
          var timeout = self.options.duration * 1000 * TIMEOUT_RATIO;
          var timeoutId;

          var removeListeners = util.onceOnTransitionEnd(elements[0], function() {
            clearTimeout(timeoutId);
            callback();
          });

          timeoutId = setTimeout(function() {
            removeListeners();
            callback();
          }, timeout);

          elements.forEach(function(element) {
            element.style[util.transitionPropertyName] = transitionValue;

            Object.keys(css).forEach(function(name) {
              element.style[name] = css[name];
            });
          });

        };
      }

      if (this.options.duration <= 0) {
        return function(callback) {
          var elements = this.elements;

          elements.forEach(function(element) {
            element.style[util.transitionPropertyName] = '';

            Object.keys(css).forEach(function(name) {
              element.style[name] = css[name];
            });
          });

          if (elements.length > 0) {
            util.forceLayoutAtOnce(elements, function() {
              util.batchAnimationFrame(callback);
            });
          } else {
            util.batchAnimationFrame(callback);
          }
        };
      }

      function createActualCssProps(css) {
        var result = {};

        Object.keys(css).forEach(function(name) {
          var value = css[name];

          if (util.hasCssProperty(name)) {
            result[name] = value;
            return;
          }

          var prefixed = util.vendorPrefix + util.capitalize(name);
          if (util.hasCssProperty(prefixed)) {
            result[prefixed] = value;
          } else {
            result[prefixed] = value;
            result[name] = value;
          }
        });

        return result;
      }
    }
  };

  return Animit;
})();

(function() {
	if (!('remove' in Element.prototype)) {
	  Element.prototype.remove = function() {
	    if (this.parentNode) {
	    	this.parentNode.removeChild(this);
	    }
	  };
	}
})();

if ("document" in self) {
  if (!("classList" in document.createElement("_"))
    || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {
    (function (view) {
    "use strict";

    if (!('Element' in view)) return;

    var
        classListProp = "classList"
      , protoProp = "prototype"
      , elemCtrProto = view.Element[protoProp]
      , objCtr = Object
      , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      }
      , arrIndexOf = Array[protoProp].indexOf || function (item) {
        var
            i = 0
          , len = this.length
        ;
        for (; i < len; i++) {
          if (i in this && this[i] === item) {
            return i;
          }
        }
        return -1;
      }
      , DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      }
      , checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
          throw new DOMEx(
              "SYNTAX_ERR"
            , "An invalid or illegal string was specified"
          );
        }
        if (/\s/.test(token)) {
          throw new DOMEx(
              "INVALID_CHARACTER_ERR"
            , "String contains an invalid character"
          );
        }
        return arrIndexOf.call(classList, token);
      }
      , ClassList = function (elem) {
        var
            trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
          , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
          , i = 0
          , len = classes.length
        ;
        for (; i < len; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function () {
          elem.setAttribute("class", this.toString());
        };
      }
      , classListProto = ClassList[protoProp] = []
      , classListGetter = function () {
        return new ClassList(this);
      }
    ;
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
      return this[i] || null;
    };
    classListProto.contains = function (token) {
      token += "";
      return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
      ;
      do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.remove = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index
      ;
      do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = checkTokenAndGetIndex(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.toggle = function (token, force) {
      token += "";

      var
          result = this.contains(token)
        , method = result ?
          force !== true && "remove"
        :
          force !== false && "add"
      ;

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };
    classListProto.toString = function () {
      return this.join(" ");
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
          get: classListGetter
        , enumerable: true
        , configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }
    }(self));
  } else {
    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());
  }
} 

if ('customElements' in window) {
  window.customElements.define = undefined;
}

(function(window){'use strict';

  var
    document = window.document,
    Object = window.Object
  ;

  var htmlClass = (function (info) {
    var
      catchClass = /^[A-Z]+[a-z]/,
      filterBy = function (re) {
        var arr = [], tag;
        for (tag in register) {
          if (re.test(tag)) arr.push(tag);
        }
        return arr;
      },
      add = function (Class, tag) {
        tag = tag.toLowerCase();
        if (!(tag in register)) {
          register[Class] = (register[Class] || []).concat(tag);
          register[tag] = (register[tag.toUpperCase()] = Class);
        }
      },
      register = (Object.create || Object)(null),
      htmlClass = {},
      i, section, tags, Class
    ;
    for (section in info) {
      for (Class in info[section]) {
        tags = info[section][Class];
        register[Class] = tags;
        for (i = 0; i < tags.length; i++) {
          register[tags[i].toLowerCase()] =
          register[tags[i].toUpperCase()] = Class;
        }
      }
    }
    htmlClass.get = function get(tagOrClass) {
      return typeof tagOrClass === 'string' ?
        (register[tagOrClass] || (catchClass.test(tagOrClass) ? [] : '')) :
        filterBy(tagOrClass);
    };
    htmlClass.set = function set(tag, Class) {
      return (catchClass.test(tag) ?
        add(tag, Class) :
        add(Class, tag)
      ), htmlClass;
    };
    return htmlClass;
  }({
    "collections": {
      "HTMLAllCollection": [
        "all"
      ],
      "HTMLCollection": [
        "forms"
      ],
      "HTMLFormControlsCollection": [
        "elements"
      ],
      "HTMLOptionsCollection": [
        "options"
      ]
    },
    "elements": {
      "Element": [
        "element"
      ],
      "HTMLAnchorElement": [
        "a"
      ],
      "HTMLAppletElement": [
        "applet"
      ],
      "HTMLAreaElement": [
        "area"
      ],
      "HTMLAttachmentElement": [
        "attachment"
      ],
      "HTMLAudioElement": [
        "audio"
      ],
      "HTMLBRElement": [
        "br"
      ],
      "HTMLBaseElement": [
        "base"
      ],
      "HTMLBodyElement": [
        "body"
      ],
      "HTMLButtonElement": [
        "button"
      ],
      "HTMLCanvasElement": [
        "canvas"
      ],
      "HTMLContentElement": [
        "content"
      ],
      "HTMLDListElement": [
        "dl"
      ],
      "HTMLDataElement": [
        "data"
      ],
      "HTMLDataListElement": [
        "datalist"
      ],
      "HTMLDetailsElement": [
        "details"
      ],
      "HTMLDialogElement": [
        "dialog"
      ],
      "HTMLDirectoryElement": [
        "dir"
      ],
      "HTMLDivElement": [
        "div"
      ],
      "HTMLDocument": [
        "document"
      ],
      "HTMLElement": [
        "element",
        "abbr",
        "address",
        "article",
        "aside",
        "b",
        "bdi",
        "bdo",
        "cite",
        "code",
        "command",
        "dd",
        "dfn",
        "dt",
        "em",
        "figcaption",
        "figure",
        "footer",
        "header",
        "i",
        "kbd",
        "mark",
        "nav",
        "noscript",
        "rp",
        "rt",
        "ruby",
        "s",
        "samp",
        "section",
        "small",
        "strong",
        "sub",
        "summary",
        "sup",
        "u",
        "var",
        "wbr"
      ],
      "HTMLEmbedElement": [
        "embed"
      ],
      "HTMLFieldSetElement": [
        "fieldset"
      ],
      "HTMLFontElement": [
        "font"
      ],
      "HTMLFormElement": [
        "form"
      ],
      "HTMLFrameElement": [
        "frame"
      ],
      "HTMLFrameSetElement": [
        "frameset"
      ],
      "HTMLHRElement": [
        "hr"
      ],
      "HTMLHeadElement": [
        "head"
      ],
      "HTMLHeadingElement": [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6"
      ],
      "HTMLHtmlElement": [
        "html"
      ],
      "HTMLIFrameElement": [
        "iframe"
      ],
      "HTMLImageElement": [
        "img"
      ],
      "HTMLInputElement": [
        "input"
      ],
      "HTMLKeygenElement": [
        "keygen"
      ],
      "HTMLLIElement": [
        "li"
      ],
      "HTMLLabelElement": [
        "label"
      ],
      "HTMLLegendElement": [
        "legend"
      ],
      "HTMLLinkElement": [
        "link"
      ],
      "HTMLMapElement": [
        "map"
      ],
      "HTMLMarqueeElement": [
        "marquee"
      ],
      "HTMLMediaElement": [
        "media"
      ],
      "HTMLMenuElement": [
        "menu"
      ],
      "HTMLMenuItemElement": [
        "menuitem"
      ],
      "HTMLMetaElement": [
        "meta"
      ],
      "HTMLMeterElement": [
        "meter"
      ],
      "HTMLModElement": [
        "del",
        "ins"
      ],
      "HTMLOListElement": [
        "ol"
      ],
      "HTMLObjectElement": [
        "object"
      ],
      "HTMLOptGroupElement": [
        "optgroup"
      ],
      "HTMLOptionElement": [
        "option"
      ],
      "HTMLOutputElement": [
        "output"
      ],
      "HTMLParagraphElement": [
        "p"
      ],
      "HTMLParamElement": [
        "param"
      ],
      "HTMLPictureElement": [
        "picture"
      ],
      "HTMLPreElement": [
        "pre"
      ],
      "HTMLProgressElement": [
        "progress"
      ],
      "HTMLQuoteElement": [
        "blockquote",
        "q",
        "quote"
      ],
      "HTMLScriptElement": [
        "script"
      ],
      "HTMLSelectElement": [
        "select"
      ],
      "HTMLShadowElement": [
        "shadow"
      ],
      "HTMLSlotElement": [
        "slot"
      ],
      "HTMLSourceElement": [
        "source"
      ],
      "HTMLSpanElement": [
        "span"
      ],
      "HTMLStyleElement": [
        "style"
      ],
      "HTMLTableCaptionElement": [
        "caption"
      ],
      "HTMLTableCellElement": [
        "td",
        "th"
      ],
      "HTMLTableColElement": [
        "col",
        "colgroup"
      ],
      "HTMLTableElement": [
        "table"
      ],
      "HTMLTableRowElement": [
        "tr"
      ],
      "HTMLTableSectionElement": [
        "thead",
        "tbody",
        "tfoot"
      ],
      "HTMLTemplateElement": [
        "template"
      ],
      "HTMLTextAreaElement": [
        "textarea"
      ],
      "HTMLTimeElement": [
        "time"
      ],
      "HTMLTitleElement": [
        "title"
      ],
      "HTMLTrackElement": [
        "track"
      ],
      "HTMLUListElement": [
        "ul"
      ],
      "HTMLUnknownElement": [
        "unknown",
        "vhgroupv",
        "vkeygen"
      ],
      "HTMLVideoElement": [
        "video"
      ]
    },
    "nodes": {
      "Attr": [
        "node"
      ],
      "Audio": [
        "audio"
      ],
      "CDATASection": [
        "node"
      ],
      "CharacterData": [
        "node"
      ],
      "Comment": [
        "#comment"
      ],
      "Document": [
        "#document"
      ],
      "DocumentFragment": [
        "#document-fragment"
      ],
      "DocumentType": [
        "node"
      ],
      "HTMLDocument": [
        "#document"
      ],
      "Image": [
        "img"
      ],
      "Option": [
        "option"
      ],
      "ProcessingInstruction": [
        "node"
      ],
      "ShadowRoot": [
        "#shadow-root"
      ],
      "Text": [
        "#text"
      ],
      "XMLDocument": [
        "xml"
      ]
    }
  }));

    var
    REGISTER_ELEMENT = 'registerElement',

    EXPANDO_UID = '__' + REGISTER_ELEMENT + (window.Math.random() * 10e4 >> 0),

    ADD_EVENT_LISTENER = 'addEventListener',
    ATTACHED = 'attached',
    CALLBACK = 'Callback',
    DETACHED = 'detached',
    EXTENDS = 'extends',

    ATTRIBUTE_CHANGED_CALLBACK = 'attributeChanged' + CALLBACK,
    ATTACHED_CALLBACK = ATTACHED + CALLBACK,
    CONNECTED_CALLBACK = 'connected' + CALLBACK,
    DISCONNECTED_CALLBACK = 'disconnected' + CALLBACK,
    CREATED_CALLBACK = 'created' + CALLBACK,
    DETACHED_CALLBACK = DETACHED + CALLBACK,

    ADDITION = 'ADDITION',
    MODIFICATION = 'MODIFICATION',
    REMOVAL = 'REMOVAL',

    DOM_ATTR_MODIFIED = 'DOMAttrModified',
    DOM_CONTENT_LOADED = 'DOMContentLoaded',
    DOM_SUBTREE_MODIFIED = 'DOMSubtreeModified',

    PREFIX_TAG = '<',
    PREFIX_IS = '=',

    validName = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,
    invalidNames = [
      'ANNOTATION-XML',
      'COLOR-PROFILE',
      'FONT-FACE',
      'FONT-FACE-SRC',
      'FONT-FACE-URI',
      'FONT-FACE-FORMAT',
      'FONT-FACE-NAME',
      'MISSING-GLYPH'
    ],

    types = [],
    protos = [],

    query = '',

    documentElement = document.documentElement,

    indexOf = types.indexOf || function (v) {
      for(var i = this.length; i-- && this[i] !== v;){}
      return i;
    },

    OP = Object.prototype,
    hOP = OP.hasOwnProperty,
    iPO = OP.isPrototypeOf,

    defineProperty = Object.defineProperty,
    empty = [],
    gOPD = Object.getOwnPropertyDescriptor,
    gOPN = Object.getOwnPropertyNames,
    gPO = Object.getPrototypeOf,
    sPO = Object.setPrototypeOf,

    hasProto = !!Object.__proto__,

    fixGetClass = false,
    DRECEV1 = '__dreCEv1',
    customElements = window.customElements,
    usableCustomElements = !!(
      customElements &&
      customElements.define &&
      customElements.get &&
      customElements.whenDefined
    ),
    Dict = Object.create || Object,
    Map = window.Map || function Map() {
      var K = [], V = [], i;
      return {
        get: function (k) {
          return V[indexOf.call(K, k)];
        },
        set: function (k, v) {
          i = indexOf.call(K, k);
          if (i < 0) V[K.push(k) - 1] = v;
          else V[i] = v;
        }
      };
    },
    Promise = window.Promise || function (fn) {
      var
        notify = [],
        done = false,
        p = {
          'catch': function () {
            return p;
          },
          'then': function (cb) {
            notify.push(cb);
            if (done) setTimeout(resolve, 1);
            return p;
          }
        }
      ;
      function resolve(value) {
        done = true;
        while (notify.length) notify.shift()(value);
      }
      fn(resolve);
      return p;
    },
    justCreated = false,
    constructors = Dict(null),
    waitingList = Dict(null),
    nodeNames = new Map(),
    secondArgument = String,

    create = Object.create || function Bridge(proto) {
      return proto ? ((Bridge.prototype = proto), new Bridge()) : this;
    },

    setPrototype = sPO || (
      hasProto ?
        function (o, p) {
          o.__proto__ = p;
          return o;
        } : (
      (gOPN && gOPD) ?
        (function(){
          function setProperties(o, p) {
            for (var
              key,
              names = gOPN(p),
              i = 0, length = names.length;
              i < length; i++
            ) {
              key = names[i];
              if (!hOP.call(o, key)) {
                defineProperty(o, key, gOPD(p, key));
              }
            }
          }
          return function (o, p) {
            do {
              setProperties(o, p);
            } while ((p = gPO(p)) && !iPO.call(p, o));
            return o;
          };
        }()) :
        function (o, p) {
          for (var key in p) {
            o[key] = p[key];
          }
          return o;
        }
    )),

    MutationObserver = window.MutationObserver ||
                       window.WebKitMutationObserver,

    HTMLElementPrototype = (
      window.HTMLElement ||
      window.Element ||
      window.Node
    ).prototype,

    IE8 = !iPO.call(HTMLElementPrototype, documentElement),

    safeProperty = IE8 ? function (o, k, d) {
      o[k] = d.value;
      return o;
    } : defineProperty,

    isValidNode = IE8 ?
      function (node) {
        return node.nodeType === 1;
      } :
      function (node) {
        return iPO.call(HTMLElementPrototype, node);
      },

    targets = IE8 && [],

    attachShadow = HTMLElementPrototype.attachShadow,
    cloneNode = HTMLElementPrototype.cloneNode,
    dispatchEvent = HTMLElementPrototype.dispatchEvent,
    getAttribute = HTMLElementPrototype.getAttribute,
    hasAttribute = HTMLElementPrototype.hasAttribute,
    removeAttribute = HTMLElementPrototype.removeAttribute,
    setAttribute = HTMLElementPrototype.setAttribute,

    createElement = document.createElement,
    patchedCreateElement = createElement,

    attributesObserver = MutationObserver && {
      attributes: true,
      characterData: true,
      attributeOldValue: true
    },

    DOMAttrModified = MutationObserver || function(e) {
      doesNotSupportDOMAttrModified = false;
      documentElement.removeEventListener(
        DOM_ATTR_MODIFIED,
        DOMAttrModified
      );
    },

    asapQueue,
    asapTimer = 0,

    setListener = false,
    doesNotSupportDOMAttrModified = true,
    dropDomContentLoaded = true,

    notFromInnerHTMLHelper = true,

    onSubtreeModified,
    callDOMAttrModified,
    getAttributesMirror,
    observer,
    observe,

    patchIfNotAlready,
    patch
  ;

  if (!(REGISTER_ELEMENT in document)) {
    if (sPO || hasProto) {
        patchIfNotAlready = function (node, proto) {
          if (!iPO.call(proto, node)) {
            setupNode(node, proto);
          }
        };
        patch = setupNode;
    } else {
        patchIfNotAlready = function (node, proto) {
          if (!node[EXPANDO_UID]) {
            node[EXPANDO_UID] = Object(true);
            setupNode(node, proto);
          }
        };
        patch = patchIfNotAlready;
    }

    if (IE8) {
      doesNotSupportDOMAttrModified = false;
      (function (){
        var
          descriptor = gOPD(HTMLElementPrototype, ADD_EVENT_LISTENER),
          addEventListener = descriptor.value,
          patchedRemoveAttribute = function (name) {
            var e = new CustomEvent(DOM_ATTR_MODIFIED, {bubbles: true});
            e.attrName = name;
            e.prevValue = getAttribute.call(this, name);
            e.newValue = null;
            e[REMOVAL] = e.attrChange = 2;
            removeAttribute.call(this, name);
            dispatchEvent.call(this, e);
          },
          patchedSetAttribute = function (name, value) {
            var
              had = hasAttribute.call(this, name),
              old = had && getAttribute.call(this, name),
              e = new CustomEvent(DOM_ATTR_MODIFIED, {bubbles: true})
            ;
            setAttribute.call(this, name, value);
            e.attrName = name;
            e.prevValue = had ? old : null;
            e.newValue = value;
            if (had) {
              e[MODIFICATION] = e.attrChange = 1;
            } else {
              e[ADDITION] = e.attrChange = 0;
            }
            dispatchEvent.call(this, e);
          },
          onPropertyChange = function (e) {
            var
              node = e.currentTarget,
              superSecret = node[EXPANDO_UID],
              propertyName = e.propertyName,
              event
            ;
            if (superSecret.hasOwnProperty(propertyName)) {
              superSecret = superSecret[propertyName];
              event = new CustomEvent(DOM_ATTR_MODIFIED, {bubbles: true});
              event.attrName = superSecret.name;
              event.prevValue = superSecret.value || null;
              event.newValue = (superSecret.value = node[propertyName] || null);
              if (event.prevValue == null) {
                event[ADDITION] = event.attrChange = 0;
              } else {
                event[MODIFICATION] = event.attrChange = 1;
              }
              dispatchEvent.call(node, event);
            }
          }
        ;
        descriptor.value = function (type, handler, capture) {
          if (
            type === DOM_ATTR_MODIFIED &&
            this[ATTRIBUTE_CHANGED_CALLBACK] &&
            this.setAttribute !== patchedSetAttribute
          ) {
            this[EXPANDO_UID] = {
              className: {
                name: 'class',
                value: this.className
              }
            };
            this.setAttribute = patchedSetAttribute;
            this.removeAttribute = patchedRemoveAttribute;
            addEventListener.call(this, 'propertychange', onPropertyChange);
          }
          addEventListener.call(this, type, handler, capture);
        };
        defineProperty(HTMLElementPrototype, ADD_EVENT_LISTENER, descriptor);
      }());
    } else if (!MutationObserver) {
      documentElement[ADD_EVENT_LISTENER](DOM_ATTR_MODIFIED, DOMAttrModified);
      documentElement.setAttribute(EXPANDO_UID, 1);
      documentElement.removeAttribute(EXPANDO_UID);
      if (doesNotSupportDOMAttrModified) {
        onSubtreeModified = function (e) {
          var
            node = this,
            oldAttributes,
            newAttributes,
            key
          ;
          if (node === e.target) {
            oldAttributes = node[EXPANDO_UID];
            node[EXPANDO_UID] = (newAttributes = getAttributesMirror(node));
            for (key in newAttributes) {
              if (!(key in oldAttributes)) {
                return callDOMAttrModified(
                  0,
                  node,
                  key,
                  oldAttributes[key],
                  newAttributes[key],
                  ADDITION
                );
              } else if (newAttributes[key] !== oldAttributes[key]) {
                return callDOMAttrModified(
                  1,
                  node,
                  key,
                  oldAttributes[key],
                  newAttributes[key],
                  MODIFICATION
                );
              }
            }
            for (key in oldAttributes) {
              if (!(key in newAttributes)) {
                return callDOMAttrModified(
                  2,
                  node,
                  key,
                  oldAttributes[key],
                  newAttributes[key],
                  REMOVAL
                );
              }
            }
          }
        };
        callDOMAttrModified = function (
          attrChange,
          currentTarget,
          attrName,
          prevValue,
          newValue,
          action
        ) {
          var e = {
            attrChange: attrChange,
            currentTarget: currentTarget,
            attrName: attrName,
            prevValue: prevValue,
            newValue: newValue
          };
          e[action] = attrChange;
          onDOMAttrModified(e);
        };
        getAttributesMirror = function (node) {
          for (var
            attr, name,
            result = {},
            attributes = node.attributes,
            i = 0, length = attributes.length;
            i < length; i++
          ) {
            attr = attributes[i];
            name = attr.name;
            if (name !== 'setAttribute') {
              result[name] = attr.value;
            }
          }
          return result;
        };
      }
    }

    document[REGISTER_ELEMENT] = function registerElement(type, options) {
      upperType = type.toUpperCase();
      if (!setListener) {
        setListener = true;
        if (MutationObserver) {
          observer = (function(attached, detached){
            function checkEmAll(list, callback) {
              for (var i = 0, length = list.length; i < length; callback(list[i++])){}
            }
            return new MutationObserver(function (records) {
              for (var
                current, node, newValue,
                i = 0, length = records.length; i < length; i++
              ) {
                current = records[i];
                if (current.type === 'childList') {
                  checkEmAll(current.addedNodes, attached);
                  checkEmAll(current.removedNodes, detached);
                } else {
                  node = current.target;
                  if (notFromInnerHTMLHelper &&
                      node[ATTRIBUTE_CHANGED_CALLBACK] &&
                      current.attributeName !== 'style') {
                    newValue = getAttribute.call(node, current.attributeName);
                    if (newValue !== current.oldValue) {
                      node[ATTRIBUTE_CHANGED_CALLBACK](
                        current.attributeName,
                        current.oldValue,
                        newValue
                      );
                    }
                  }
                }
              }
            });
          }(executeAction(ATTACHED), executeAction(DETACHED)));
          observe = function (node) {
            observer.observe(
              node,
              {
                childList: true,
                subtree: true
              }
            );
            return node;
          };
          observe(document);
          if (attachShadow) {
            HTMLElementPrototype.attachShadow = function () {
              return observe(attachShadow.apply(this, arguments));
            };
          }
        } else {
          asapQueue = [];
          document[ADD_EVENT_LISTENER]('DOMNodeInserted', onDOMNode(ATTACHED));
          document[ADD_EVENT_LISTENER]('DOMNodeRemoved', onDOMNode(DETACHED));
        }

        document[ADD_EVENT_LISTENER](DOM_CONTENT_LOADED, onReadyStateChange);
        document[ADD_EVENT_LISTENER]('readystatechange', onReadyStateChange);

        HTMLElementPrototype.cloneNode = function (deep) {
          var
            node = cloneNode.call(this, !!deep),
            i = getTypeIndex(node)
          ;
          if (-1 < i) patch(node, protos[i]);
          if (deep) loopAndSetup(node.querySelectorAll(query));
          return node;
        };
      }

      if (-2 < (
        indexOf.call(types, PREFIX_IS + upperType) +
        indexOf.call(types, PREFIX_TAG + upperType)
      )) {
        throwTypeError(type);
      }

      if (!validName.test(upperType) || -1 < indexOf.call(invalidNames, upperType)) {
        throw new Error('The type ' + type + ' is invalid');
      }

      var
        constructor = function () {
          return extending ?
            document.createElement(nodeName, upperType) :
            document.createElement(nodeName);
        },
        opt = options || OP,
        extending = hOP.call(opt, EXTENDS),
        nodeName = extending ? options[EXTENDS].toUpperCase() : upperType,
        upperType,
        i
      ;

      if (extending && -1 < (
        indexOf.call(types, PREFIX_TAG + nodeName)
      )) {
        throwTypeError(nodeName);
      }

      i = types.push((extending ? PREFIX_IS : PREFIX_TAG) + upperType) - 1;

      query = query.concat(
        query.length ? ',' : '',
        extending ? nodeName + '[is="' + type.toLowerCase() + '"]' : nodeName
      );

      constructor.prototype = (
        protos[i] = hOP.call(opt, 'prototype') ?
          opt.prototype :
          create(HTMLElementPrototype));

      loopAndVerify(
        document.querySelectorAll(query),
        ATTACHED
      );

      return constructor;
    };

    document.createElement = (patchedCreateElement = function (localName, typeExtension) {
      var
        is = getIs(typeExtension),
        node = is ?
          createElement.call(document, localName, secondArgument(is)) :
          createElement.call(document, localName),
        name = '' + localName,
        i = indexOf.call(
          types,
          (is ? PREFIX_IS : PREFIX_TAG) +
          (is || name).toUpperCase()
        ),
        setup = -1 < i
      ;
      if (is) {
        node.setAttribute('is', is = is.toLowerCase());
        if (setup) {
          setup = isInQSA(name.toUpperCase(), is);
        }
      }
      notFromInnerHTMLHelper = !document.createElement.innerHTMLHelper;
      if (setup) patch(node, protos[i]);
      return node;
    });
  }

  function ASAP() {
    var queue = asapQueue.splice(0, asapQueue.length);
    asapTimer = 0;
    while (queue.length) {
      queue.shift().call(
        null, queue.shift());
    }
  }

  function loopAndVerify(list, action) {
    for (var i = 0, length = list.length; i < length; i++) {
      verifyAndSetupAndAction(list[i], action);
    }
  }

  function loopAndSetup(list) {
    for (var i = 0, length = list.length, node; i < length; i++) {
      node = list[i];
      patch(node, protos[getTypeIndex(node)]);
    }
  }

  function executeAction(action) {
    return function (node) {
      if (isValidNode(node)) {
        verifyAndSetupAndAction(node, action);
        loopAndVerify(
          node.querySelectorAll(query),
          action
        );
      }
    };
  }

  function getTypeIndex(target) {
    var
      is = getAttribute.call(target, 'is'),
      nodeName = target.nodeName.toUpperCase(),
      i = indexOf.call(
        types,
        is ?
            PREFIX_IS + is.toUpperCase() :
            PREFIX_TAG + nodeName
      )
    ;
    return is && -1 < i && !isInQSA(nodeName, is) ? -1 : i;
  }

  function isInQSA(name, type) {
    return -1 < query.indexOf(name + '[is="' + type + '"]');
  }

  function onDOMAttrModified(e) {
    var
      node = e.currentTarget,
      attrChange = e.attrChange,
      attrName = e.attrName,
      target = e.target,
      addition = e[ADDITION] || 2,
      removal = e[REMOVAL] || 3
    ;
    if (notFromInnerHTMLHelper &&
        (!target || target === node) &&
        node[ATTRIBUTE_CHANGED_CALLBACK] &&
        attrName !== 'style' && (
          e.prevValue !== e.newValue ||
          e.newValue === '' && (
            attrChange === addition ||
            attrChange === removal
          )
    )) {
      node[ATTRIBUTE_CHANGED_CALLBACK](
        attrName,
        attrChange === addition ? null : e.prevValue,
        attrChange === removal ? null : e.newValue
      );
    }
  }

  function onDOMNode(action) {
    var executor = executeAction(action);
    return function (e) {
      asapQueue.push(executor, e.target);
      if (asapTimer) clearTimeout(asapTimer);
      asapTimer = setTimeout(ASAP, 1);
    };
  }

  function onReadyStateChange(e) {
    if (dropDomContentLoaded) {
      dropDomContentLoaded = false;
      e.currentTarget.removeEventListener(DOM_CONTENT_LOADED, onReadyStateChange);
    }
    loopAndVerify(
      (e.target || document).querySelectorAll(query),
      e.detail === DETACHED ? DETACHED : ATTACHED
    );
    if (IE8) purge();
  }

  function patchedSetAttribute(name, value) {
    var self = this;
    setAttribute.call(self, name, value);
    onSubtreeModified.call(self, {target: self});
  }

  function setupNode(node, proto) {
    setPrototype(node, proto);
    if (observer) {
      observer.observe(node, attributesObserver);
    } else {
      if (doesNotSupportDOMAttrModified) {
        node.setAttribute = patchedSetAttribute;
        node[EXPANDO_UID] = getAttributesMirror(node);
        node[ADD_EVENT_LISTENER](DOM_SUBTREE_MODIFIED, onSubtreeModified);
      }
      node[ADD_EVENT_LISTENER](DOM_ATTR_MODIFIED, onDOMAttrModified);
    }
    if (node[CREATED_CALLBACK] && notFromInnerHTMLHelper) {
      node.created = true;
      node[CREATED_CALLBACK]();
      node.created = false;
    }
  }

  function purge() {
    for (var
      node,
      i = 0,
      length = targets.length;
      i < length; i++
    ) {
      node = targets[i];
      if (!documentElement.contains(node)) {
        length--;
        targets.splice(i--, 1);
        verifyAndSetupAndAction(node, DETACHED);
      }
    }
  }

  function throwTypeError(type) {
    throw new Error('A ' + type + ' type is already registered');
  }

  function verifyAndSetupAndAction(node, action) {
    var
      fn,
      i = getTypeIndex(node)
    ;
    if (-1 < i) {
      patchIfNotAlready(node, protos[i]);
      i = 0;
      if (action === ATTACHED && !node[ATTACHED]) {
        node[DETACHED] = false;
        node[ATTACHED] = true;
        i = 1;
        if (IE8 && indexOf.call(targets, node) < 0) {
          targets.push(node);
        }
      } else if (action === DETACHED && !node[DETACHED]) {
        node[ATTACHED] = false;
        node[DETACHED] = true;
        i = 1;
      }
      if (i && (fn = node[action + CALLBACK])) fn.call(node);
    }
  }

  function CustomElementRegistry() {}

  CustomElementRegistry.prototype = {
    constructor: CustomElementRegistry,
    define: usableCustomElements ?
      function (name, Class, options) {
        if (options) {
          CERDefine(name, Class, options);
        } else {
          var NAME = name.toUpperCase();
          constructors[NAME] = {
            constructor: Class,
            create: [NAME]
          };
          nodeNames.set(Class, NAME);
          customElements.define(name, Class);
        }
      } :
      CERDefine,
    get: usableCustomElements ?
      function (name) {
        return customElements.get(name) || get(name);
      } :
      get,
    whenDefined: usableCustomElements ?
      function (name) {
        return Promise.race([
          customElements.whenDefined(name),
          whenDefined(name)
        ]);
      } :
      whenDefined
  };

  function CERDefine(name, Class, options) {
    var
      is = options && options[EXTENDS] || '',
      CProto = Class.prototype,
      proto = create(CProto),
      attributes = Class.observedAttributes || empty,
      definition = {prototype: proto}
    ;
    safeProperty(proto, CREATED_CALLBACK, {
        value: function () {
          if (justCreated) justCreated = false;
          else if (!this[DRECEV1]) {
            this[DRECEV1] = true;
            new Class(this);
            if (CProto[CREATED_CALLBACK])
              CProto[CREATED_CALLBACK].call(this);
            var info = constructors[nodeNames.get(Class)];
            if (!usableCustomElements || info.create.length > 1) {
              notifyAttributes(this);
            }
          }
      }
    });
    safeProperty(proto, ATTRIBUTE_CHANGED_CALLBACK, {
      value: function (name) {
        if (-1 < indexOf.call(attributes, name))
          CProto[ATTRIBUTE_CHANGED_CALLBACK].apply(this, arguments);
      }
    });
    if (CProto[CONNECTED_CALLBACK]) {
      safeProperty(proto, ATTACHED_CALLBACK, {
        value: CProto[CONNECTED_CALLBACK]
      });
    }
    if (CProto[DISCONNECTED_CALLBACK]) {
      safeProperty(proto, DETACHED_CALLBACK, {
        value: CProto[DISCONNECTED_CALLBACK]
      });
    }
    if (is) definition[EXTENDS] = is;
    name = name.toUpperCase();
    constructors[name] = {
      constructor: Class,
      create: is ? [is, secondArgument(name)] : [name]
    };
    nodeNames.set(Class, name);
    document[REGISTER_ELEMENT](name.toLowerCase(), definition);
    whenDefined(name);
    waitingList[name].r();
  }

  function get(name) {
    var info = constructors[name.toUpperCase()];
    return info && info.constructor;
  }

  function getIs(options) {
    return typeof options === 'string' ?
        options : (options && options.is || '');
  }

  function notifyAttributes(self) {
    var
      callback = self[ATTRIBUTE_CHANGED_CALLBACK],
      attributes = callback ? self.attributes : empty,
      i = attributes.length,
      attribute
    ;
    while (i--) {
      attribute =  attributes[i]; // || attributes.item(i);
      callback.call(
        self,
        attribute.name || attribute.nodeName,
        null,
        attribute.value || attribute.nodeValue
      );
    }
  }

  function whenDefined(name) {
    name = name.toUpperCase();
    if (!(name in waitingList)) {
      waitingList[name] = {};
      waitingList[name].p = new Promise(function (resolve) {
        waitingList[name].r = resolve;
      });
    }
    return waitingList[name].p;
  }

  function polyfillV1() {
    if (customElements) delete window.customElements;
    defineProperty(window, 'customElements', {
      configurable: true,
      value: new CustomElementRegistry()
    });
    defineProperty(window, 'CustomElementRegistry', {
      configurable: true,
      value: CustomElementRegistry
    });
    for (var
      patchClass = function (name) {
        var Class = window[name];
        if (Class) {
          window[name] = function CustomElementsV1(self) {
            var info, isNative;
            if (!self) self = this;
            if (!self[DRECEV1]) {
              justCreated = true;
              info = constructors[nodeNames.get(self.constructor)];
              isNative = usableCustomElements && info.create.length === 1;
              self = isNative ?
                Reflect.construct(Class, empty, info.constructor) :
                document.createElement.apply(document, info.create);
              self[DRECEV1] = true;
              justCreated = false;
              if (!isNative) notifyAttributes(self);
            }
            return self;
          };
          window[name].prototype = Class.prototype;
          try {
            Class.prototype.constructor = window[name];
          } catch(WebKit) {
            fixGetClass = true;
            defineProperty(Class, DRECEV1, {value: window[name]});
          }
        }
      },
      Classes = htmlClass.get(/^HTML[A-Z]*[a-z]/),
      i = Classes.length;
      i--;
      patchClass(Classes[i])
    ) {}
    (document.createElement = function (name, options) {
      var is = getIs(options);
      return is ?
        patchedCreateElement.call(this, name, secondArgument(is)) :
        patchedCreateElement.call(this, name);
    });
  }

  if (!customElements) polyfillV1();
  else {
    try {
      (function (DRE, options, name) {
        options[EXTENDS] = 'a';
        DRE.prototype = create(HTMLAnchorElement.prototype);
        DRE.prototype.constructor = DRE;
        window.customElements.define(name, DRE, options);
        if (
          getAttribute.call(document.createElement('a', {is: name}), 'is') !== name ||
          (usableCustomElements && getAttribute.call(new DRE(), 'is') !== name)
        ) {
          throw options;
        }
      }(
        function DRE() {
          return Reflect.construct(HTMLAnchorElement, [], DRE);
        },
        {},
        'document-register-element-a'
      ));
    } catch(o_O) {
      polyfillV1();
    }
  }

  try {
    createElement.call(document, 'a', 'a');
  } catch(FireFox) {
    secondArgument = function (is) {
      return {is: is};
    };
  }
} (window));

;(function () {
	'use strict';

	

	
	

	
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		
		this.trackingClick = false;

		
		this.trackingClickStart = 0;

		
		this.targetElement = null;

		
		this.touchStartX = 0;

		
		this.touchStartY = 0;

		
		this.lastTouchIdentifier = 0;

		
		this.touchBoundary = options.touchBoundary || 10;

		
		this.layer = layer;

		
		this.tapDelay = options.tapDelay || 200;

		
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}

		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;

	
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;

	
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);

	
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};

	
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};

	
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesize a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};

	
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};

	
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};

	
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};

	
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay && (event.timeStamp - this.lastClickTime) > -1) {
			event.preventDefault();
		}

		return true;
	};

	
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};

	
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};

	
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};

	
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay && (event.timeStamp - this.lastClickTime) > -1) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};

	
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};

	
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};

	
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behavior on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};

	
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};

	
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recommended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};

	
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};

  window.FastClick = FastClick;
}());

var innerHTML = (function (document) {
  var
    EXTENDS = 'extends',
    register = document.registerElement,
    div = document.createElement('div'),
    dre = 'document-register-element',
    innerHTML = register.innerHTML,
    initialize,
    registered
  ;

  if (innerHTML) return innerHTML;

  try {
    register.call(
      document,
      dre,
      {prototype: Object.create(
        HTMLElement.prototype,
        {createdCallback: {value: Object}}
      )}
    );

    div.innerHTML = '<' + dre + '></' + dre + '>';

    if ('createdCallback' in div.querySelector(dre)) {
      return (register.innerHTML = function (el, html) {
        el.innerHTML = html;
        return el;
      });
    }
  } catch(meh) {}

  registered = [];
  initialize = function (el) {
    if (
      'createdCallback' in el         ||
      'attachedCallback' in el        ||
      'detachedCallback' in el        ||
      'attributeChangedCallback' in el
    ) return;
    document.createElement.innerHTMLHelper = true;
    for (var
      parentNode = el.parentNode,
      type = el.getAttribute('is'),
      name = el.nodeName,
      node = document.createElement.apply(
        document,
        type ? [name, type] : [name]
      ),
      attributes = el.attributes,
      i = 0,
      length = attributes.length,
      attr, fc;
      i < length; i++
    ) {
      attr = attributes[i];
      node.setAttribute(attr.name, attr.value);
    }
    if (node.createdCallback) {
      node.created = true;
      node.createdCallback();
      node.created = false;
    }
    while ((fc = el.firstChild)) node.appendChild(fc);
    document.createElement.innerHTMLHelper = false;
    if (parentNode) parentNode.replaceChild(node, el);
  };
  return ((document.registerElement = function registerElement(type, options) {
    var name = (options[EXTENDS] ?
      (options[EXTENDS] + '[is="' + type + '"]') : type
    ).toLowerCase();
    if (registered.indexOf(name) < 0) registered.push(name);
    return register.apply(document, arguments);
  }).innerHTML = function (el, html) {
    el.innerHTML = html;
    for (var
      nodes = el.querySelectorAll(registered.join(',')),
      i = nodes.length; i--; initialize(nodes[i])
    ) {}
    return el;
  });
}(document));

var MicroEvent  = function(){};
MicroEvent.prototype  = {
  on  : function(event, fct){
    this._events = this._events || {};
    this._events[event] = this._events[event] || [];
    this._events[event].push(fct);
  },
  once : function(event, fct){
    var self = this;
    var wrapper = function() {
      self.off(event, wrapper);
      return fct.apply(null, arguments);
    };
    this.on(event, wrapper);
  },
  off  : function(event, fct){
    this._events = this._events || {};
    if( event in this._events === false  )  return;
    this._events[event].splice(this._events[event].indexOf(fct), 1);
  },
  emit : function(event ){
    this._events = this._events || {};
    if( event in this._events === false  )  return;
    for(var i = 0; i < this._events[event].length; i++){
      this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
    }
  }
};

MicroEvent.mixin  = function(destObject){
  var props = ['on', 'once', 'off', 'emit'];
  for(var i = 0; i < props.length; i ++){
    if( typeof destObject === 'function' ){
      destObject.prototype[props[i]]  = MicroEvent.prototype[props[i]];
    }else{
      destObject[props[i]] = MicroEvent.prototype[props[i]];
    }
  }
}

if( typeof module !== "undefined" && ('exports' in module)){
  module.exports  = MicroEvent;
}

window.MicroEvent = MicroEvent;

(function (root) {
  var setTimeoutFunc = setTimeout;

  function noop() {}

  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };

  if (!window.Promise) {
    window.Promise = Promise;
  }
})(this);

(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        if (currentlyRunningATask) {
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    if ({}.toString.call(global.process) === "[object process]") {
        installNextTickImplementation();
    } else if (canUsePostMessage()) {
        installPostMessageImplementation();
    } else if (global.MessageChannel) {
        installMessageChannelImplementation();
    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        installReadyStateChangeImplementation();
    } else {
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(function() {return this;}()));

(function() {
    function Viewport() {
        this.PRE_IOS7_VIEWPORT = "initial-scale=1, maximum-scale=1, user-scalable=no";
        this.IOS7_VIEWPORT     = "initial-scale=1, maximum-scale=1, user-scalable=no";
        this.DEFAULT_VIEWPORT  = "initial-scale=1, maximum-scale=1, user-scalable=no";

        this.ensureViewportElement();
        this.platform = {};
        this.platform.name = this.getPlatformName();
        this.platform.version = this.getPlatformVersion();

        return this;
    };

    Viewport.prototype.ensureViewportElement = function(){
        this.viewportElement = document.querySelector('meta[name=viewport]');
        if(!this.viewportElement){
            this.viewportElement = document.createElement('meta');
            this.viewportElement.name = "viewport";
            document.head.appendChild(this.viewportElement);
        }
    },

    Viewport.prototype.setup = function() {
        if (!this.viewportElement) {
            return;
        }

        if (this.viewportElement.getAttribute('data-no-adjust') == "true") {
            return;
        }

        if (!this.viewportElement.getAttribute('content')) {
            if (this.platform.name == 'ios') {
                if (this.platform.version >= 7 && isWebView()) {
                    this.viewportElement.setAttribute('content', this.IOS7_VIEWPORT);
                } else {
                    this.viewportElement.setAttribute('content', this.PRE_IOS7_VIEWPORT);
                }
            } else {
                this.viewportElement.setAttribute('content', this.DEFAULT_VIEWPORT);
            }
        }

        function isWebView() {
            return !!(window.cordova || window.phonegap || window.PhoneGap);
        }
    };

    Viewport.prototype.getPlatformName = function() {
        if (navigator.userAgent.match(/Android/i)) {
            return "android";
        }

        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            return "ios";
        }

        return undefined;
    };

    Viewport.prototype.getPlatformVersion = function() {
        var start = window.navigator.userAgent.indexOf('OS ');
        return window.Number(window.navigator.userAgent.substr(start + 3, 3).replace('_', '.'));
    };

    window.Viewport = Viewport;
})();

(function () {
    if (window.MSApp && MSApp.execUnsafeLocalFunction) {
        var Element_setAttribute = Object.getOwnPropertyDescriptor(Element.prototype, "setAttribute").value;
        var Element_removeAttribute = Object.getOwnPropertyDescriptor(Element.prototype, "removeAttribute").value;
        var HTMLElement_insertAdjacentHTMLPropertyDescriptor = 
          Object.getOwnPropertyDescriptor(HTMLElement.prototype, "insertAdjacentHTML");
        var Node_get_attributes = Object.getOwnPropertyDescriptor(Node.prototype, "attributes").get;
        var Node_get_childNodes = Object.getOwnPropertyDescriptor(Node.prototype, "childNodes").get;
        var detectionDiv = document.createElement("div");

        function getAttributes(element) {
            return Node_get_attributes.call(element);
        }

        function setAttribute(element, attribute, value) {
            try {
                Element_setAttribute.call(element, attribute, value);
            } catch (e) {
            }
        }

        function removeAttribute(element, attribute) {
            Element_removeAttribute.call(element, attribute);
        }

        function childNodes(element) {
            return Node_get_childNodes.call(element);
        }

        function empty(element) {
            while (element.childNodes.length) {
                element.removeChild(element.lastChild);
            }
        }

        function insertAdjacentHTML(element, position, html) {
            HTMLElement_insertAdjacentHTMLPropertyDescriptor.value.call(element, position, html);
        }

        function inUnsafeMode() {
            var isUnsafe = true;
            try {
                detectionDiv.innerHTML = "<test/>";
            }
            catch (ex) {
                isUnsafe = false;
            }

            return isUnsafe;
        }

        function cleanse(html, targetElement) {
            var cleaner = document.implementation.createHTMLDocument("cleaner");
            empty(cleaner.documentElement);
            MSApp.execUnsafeLocalFunction(function () {
                insertAdjacentHTML(cleaner.documentElement, "afterbegin", html);
            });

            var scripts = cleaner.documentElement.querySelectorAll("script");
            Array.prototype.forEach.call(scripts, function (script) {
                switch (script.type.toLowerCase()) {
                    case "":
                        script.type = "text/inert";
                        break;
                    case "text/javascript":
                    case "text/ecmascript":
                    case "text/x-javascript":
                    case "text/jscript":
                    case "text/livescript":
                    case "text/javascript1.1":
                    case "text/javascript1.2":
                    case "text/javascript1.3":
                        script.type = "text/inert-" + script.type.slice("text/".length);
                        break;
                    case "application/javascript":
                    case "application/ecmascript":
                    case "application/x-javascript":
                        script.type = "application/inert-" + script.type.slice("application/".length);
                        break;

                    default:
                        break;
                }
            });

            function cleanseAttributes(element) {
                var attributes = getAttributes(element);
                if (attributes && attributes.length) {
                    var events;
                    for (var i = 0, len = attributes.length; i < len; i++) {
                        var attribute = attributes[i];
                        var name = attribute.name;
                        if ((name[0] === "o" || name[0] === "O") &&
                            (name[1] === "n" || name[1] === "N")) {
                            events = events || [];
                            events.push({ name: attribute.name, value: attribute.value });
                        }
                    }
                    if (events) {
                        for (var i = 0, len = events.length; i < len; i++) {
                            var attribute = events[i];
                            removeAttribute(element, attribute.name);
                            setAttribute(element, "x-" + attribute.name, attribute.value);
                        }
                    }
                }
                var children = childNodes(element);
                for (var i = 0, len = children.length; i < len; i++) {
                    cleanseAttributes(children[i]);
                }
            }
            cleanseAttributes(cleaner.documentElement);

            var cleanedNodes = [];

            if (targetElement.tagName === 'HTML') {
                cleanedNodes = Array.prototype.slice.call(document.adoptNode(cleaner.documentElement).childNodes);
            } else {
                if (cleaner.head) {
                    cleanedNodes = cleanedNodes.concat(Array.prototype.slice.call(document.adoptNode(cleaner.head).childNodes));
                }
                if (cleaner.body) {
                    cleanedNodes = cleanedNodes.concat(Array.prototype.slice.call(document.adoptNode(cleaner.body).childNodes));
                }
            }

            return cleanedNodes;
        }

        function cleansePropertySetter(property, setter) {
            var propertyDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, property);
            var originalSetter = propertyDescriptor.set;
            Object.defineProperty(HTMLElement.prototype, property, {
                get: propertyDescriptor.get,
                set: function (value) {
                    if(window.WinJS && window.WinJS._execUnsafe && inUnsafeMode()) {
                        originalSetter.call(this, value);
                    } else {
                        var that = this;
                        var nodes = cleanse(value, that);
                        MSApp.execUnsafeLocalFunction(function () {
                            setter(propertyDescriptor, that, nodes);
                        });
                    }
                },
                enumerable: propertyDescriptor.enumerable,
                configurable: propertyDescriptor.configurable,
            });
        }
        cleansePropertySetter("innerHTML", function (propertyDescriptor, target, elements) {
            empty(target);
            for (var i = 0, len = elements.length; i < len; i++) {
                target.appendChild(elements[i]);
            }
        });
        cleansePropertySetter("outerHTML", function (propertyDescriptor, target, elements) {
            for (var i = 0, len = elements.length; i < len; i++) {
                target.insertAdjacentElement("afterend", elements[i]);
            }
            target.parentNode.removeChild(target);
        });
    }
} ());


(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global.ons = factory());
}(this, function () { 'use strict';

   var babelHelpers = {};
   babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
     return typeof obj;
   } : function (obj) {
     return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
   };

   babelHelpers.classCallCheck = function (instance, Constructor) {
     if (!(instance instanceof Constructor)) {
       throw new TypeError("Cannot call a class as a function");
     }
   };

   babelHelpers.createClass = function () {
     function defineProperties(target, props) {
       for (var i = 0; i < props.length; i++) {
         var descriptor = props[i];
         descriptor.enumerable = descriptor.enumerable || false;
         descriptor.configurable = true;
         if ("value" in descriptor) descriptor.writable = true;
         Object.defineProperty(target, descriptor.key, descriptor);
       }
     }

     return function (Constructor, protoProps, staticProps) {
       if (protoProps) defineProperties(Constructor.prototype, protoProps);
       if (staticProps) defineProperties(Constructor, staticProps);
       return Constructor;
     };
   }();

   babelHelpers.inherits = function (subClass, superClass) {
     if (typeof superClass !== "function" && superClass !== null) {
       throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
     }

     subClass.prototype = Object.create(superClass && superClass.prototype, {
       constructor: {
         value: subClass,
         enumerable: false,
         writable: true,
         configurable: true
       }
     });
     if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
   };

   babelHelpers.possibleConstructorReturn = function (self, call) {
     if (!self) {
       throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
     }

     return call && (typeof call === "object" || typeof call === "function") ? call : self;
   };

   babelHelpers;

   var unwrap = function unwrap(string) {
     return string.slice(1, -1);
   };
   var isObjectString = function isObjectString(string) {
     return string.startsWith('{') && string.endsWith('}');
   };
   var isArrayString = function isArrayString(string) {
     return string.startsWith('[') && string.endsWith(']');
   };
   var isQuotedString = function isQuotedString(string) {
     return string.startsWith('\'') && string.endsWith('\'') || string.startsWith('"') && string.endsWith('"');
   };

   var error = function error(token, string, originalString) {
     throw new Error('Unexpected token \'' + token + '\' at position ' + (originalString.length - string.length - 1) + 
      ' in string: \'' + originalString + '\'');
   };

   var processToken = function processToken(token, string, originalString) {
     if (token === 'true' || token === 'false') {
       return token === 'true';
     } else if (isQuotedString(token)) {
       return unwrap(token);
     } else if (!isNaN(token)) {
       return +token;
     } else if (isObjectString(token)) {
       return parseObject(unwrap(token));
     } else if (isArrayString(token)) {
       return parseArray(unwrap(token));
     } else {
       error(token, string, originalString);
     }
   };

   var nextToken = function nextToken(string) {
     string = string.trimLeft();
     var limit = string.length;

     if (string[0] === ':' || string[0] === ',') {
       limit = 1;
     } else if (string[0] === '{' || string[0] === '[') {
       var c = string.charCodeAt(0);
       var nestedObject = 1;
       for (var i = 1; i < string.length; i++) {
         if (string.charCodeAt(i) === c) {
           nestedObject++;
         } else if (string.charCodeAt(i) === c + 2) {
           nestedObject--;
           if (nestedObject === 0) {
             limit = i + 1;
             break;
           }
         }
       }
     } else if (string[0] === '\'' || string[0] === '\"') {
       for (var _i = 1; _i < string.length; _i++) {
         if (string[_i] === string[0]) {
           limit = _i + 1;
           break;
         }
       }
     } else {
       for (var _i2 = 1; _i2 < string.length; _i2++) {
         if ([' ', ',', ':'].indexOf(string[_i2]) !== -1) {
           limit = _i2;
           break;
         }
       }
     }

     return string.slice(0, limit);
   };

   var parseObject = function parseObject(string) {
     var isValidKey = function isValidKey(key) {
       return (/^[A-Z_\$][A-Z0-9_\$]*$/i.test(key));
     };

     string = string.trim();
     var originalString = string;
     var object = {};
     var readingKey = true,
         key = void 0,
         previousToken = void 0,
         token = void 0;

     while (string.length > 0) {
       previousToken = token;
       token = nextToken(string);
       string = string.slice(token.length, string.length).trimLeft();

       if (token === ':' && (!readingKey || !previousToken || previousToken === ',') || token === ',' && readingKey || 
        token !== ':' && token !== ',' && previousToken && previousToken !== ',' && previousToken !== ':') {
         error(token, string, originalString);
       } else if (token === ':' && readingKey && previousToken) {
         if (isValidKey(previousToken)) {
           key = previousToken;
           readingKey = false;
         } else {
           throw new Error('Invalid key token \'' + previousToken + '\' at position 0 in string: \'' + originalString + '\'');
         }
       } else if (token === ',' && !readingKey && previousToken) {
         object[key] = processToken(previousToken, string, originalString);
         readingKey = true;
       }
     }

     if (token) {
       object[key] = processToken(token, string, originalString);
     }

     return object;
   };

   var parseArray = function parseArray(string) {
     string = string.trim();
     var originalString = string;
     var array = [];
     var previousToken = void 0,
         token = void 0;

     while (string.length > 0) {
       previousToken = token;
       token = nextToken(string);
       string = string.slice(token.length, string.length).trimLeft();

       if (token === ',' && (!previousToken || previousToken === ',')) {
         error(token, string, originalString);
       } else if (token === ',') {
         array.push(processToken(previousToken, string, originalString));
       }
     }

     if (token) {
       if (token !== ',') {
         array.push(processToken(token, string, originalString));
       } else {
         error(token, string, originalString);
       }
     }

     return array;
   };

   var parse = function parse(string) {
     string = string.trim();

     if (isObjectString(string)) {
       return parseObject(unwrap(string));
     } else if (isArrayString(string)) {
       return parseArray(unwrap(string));
     } else {
       throw new Error('Provided string must be object or array like: ' + string);
     }
   };

   var util = {};

   util.prepareQuery = function (query) {
     return query instanceof Function ? query : function (element) {
       return util.match(element, query);
     };
   };

   util.match = function (element, query) {
     if (query[0] === '.') {
       return element.classList.contains(query.slice(1));
     }
     return element.nodeName.toLowerCase() === query;
   };

   util.findChild = function (element, query) {
     var match = util.prepareQuery(query);

     for (var i = 0; i < element.children.length; i++) {
       var node = element.children[i];
       if (match(node)) {
         return node;
       }
     }
     return null;
   };

   util.findParent = function (element, query) {
     var match = util.prepareQuery(query);

     var parent = element.parentNode;
     for (;;) {
       if (!parent || parent === document) {
         return null;
       }
       if (match(parent)) {
         return parent;
       }
       parent = parent.parentNode;
     }
   };

   util.isAttached = function (element) {
     while (document.documentElement !== element) {
       if (!element) {
         return false;
       }
       element = element.parentNode;
     }
     return true;
   };

   util.hasAnyComponentAsParent = function (element) {
     while (element && document.documentElement !== element) {
       element = element.parentNode;
       if (element && element.nodeName.toLowerCase().match(/(ons-navigator|ons-tabbar|ons-sliding-menu|ons-split-view)/)) {
         return true;
       }
     }
     return false;
   };

   util.propagateAction = function (element, action) {
     for (var i = 0; i < element.childNodes.length; i++) {
       var child = element.childNodes[i];
       if (child[action] instanceof Function) {
         child[action]();
       } else {
         util.propagateAction(child, action);
       }
     }
   };

   util.create = function () {
     var selector = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
     var style = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

     var classList = selector.split('.');
     var element = document.createElement(classList.shift() || 'div');

     if (classList.length) {
       element.className = classList.join(' ');
     }

     util.extend(element.style, style);

     return element;
   };

   util.createElement = function (html) {
     var wrapper = document.createElement('div');
     innerHTML(wrapper, html);

     if (wrapper.children.length > 1) {
       throw new Error('"html" must be one wrapper element.');
     }

     return wrapper.children[0];
   };

   util.createFragment = function (html) {
     var wrapper = document.createElement('div');
     innerHTML(wrapper, html);
     var fragment = document.createDocumentFragment();

     while (wrapper.firstChild) {
       fragment.appendChild(wrapper.firstChild);
     }

     return fragment;
   };

   util.extend = function (dst) {
     for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
       args[_key - 1] = arguments[_key];
     }

     for (var i = 0; i < args.length; i++) {
       if (args[i]) {
         var keys = Object.keys(args[i]);
         for (var j = 0; j < keys.length; j++) {
           var key = keys[j];
           dst[key] = args[i][key];
         }
       }
     }

     return dst;
   };

   util.arrayFrom = function (arrayLike) {
     return Array.prototype.slice.apply(arrayLike);
   };

   util.parseJSONObjectSafely = function (jsonString) {
     var failSafe = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

     try {
       var result = JSON.parse('' + jsonString);
       if ((typeof result === 'undefined' ? 'undefined' : babelHelpers.typeof(result)) === 'object' && result !== null) {
         return result;
       }
     } catch (e) {
       return failSafe;
     }
     return failSafe;
   };

   util.findFromPath = function (path) {
     path = path.split('.');
     var el = window,
         key;
     while (key = path.shift()) {
       el = el[key];
     }
     return el;
   };

   util.triggerElementEvent = function (target, eventName) {
     var detail = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

     var event = new CustomEvent(eventName, {
       bubbles: true,
       cancelable: true,
       detail: detail
     });

     Object.keys(detail).forEach(function (key) {
       event[key] = detail[key];
     });

     target.dispatchEvent(event);

     return event;
   };

   util.hasModifier = function (target, modifierName) {
     if (!target.hasAttribute('modifier')) {
       return false;
     }
     return target.getAttribute('modifier').split(/\s+/).some(function (e) {
       return e === modifierName;
     });
   };

   util.addModifier = function (target, modifierName) {
     if (util.hasModifier(target, modifierName)) {
       return false;
     }

     modifierName = modifierName.trim();
     var modifierAttribute = target.getAttribute('modifier') || '';
     target.setAttribute('modifier', (modifierAttribute + ' ' + modifierName).trim());
     return true;
   };

   util.removeModifier = function (target, modifierName) {
     if (!target.getAttribute('modifier')) {
       return false;
     }

     var modifiers = target.getAttribute('modifier').split(/\s+/);

     var newModifiers = modifiers.filter(function (item) {
       return item && item !== modifierName;
     });
     target.setAttribute('modifier', newModifiers.join(' '));

     return modifiers.length !== newModifiers.length;
   };

   util.updateParentPosition = function (el) {
     if (!el._parentUpdated && el.parentElement) {
       if (window.getComputedStyle(el.parentElement).getPropertyValue('position') === 'static') {
         el.parentElement.style.position = 'relative';
       }
       el._parentUpdated = true;
     }
   };

   util.toggleAttribute = function (element, name, enable) {
     if (enable) {
       element.setAttribute(name, '');
     } else {
       element.removeAttribute(name);
     }
   };

   util.bindListeners = function (element, listenerNames) {
     listenerNames.forEach(function (name) {
       var boundName = name.replace(/^_[a-z]/, '_bound' + name[1].toUpperCase());
       element[boundName] = element[boundName] || element[name].bind(element);
     });
   };

   util.each = function (obj, f) {
     return Object.keys(obj).forEach(function (key) {
       return f(key, obj[key]);
     });
   };

   util.updateRipple = function (target) {
     var rippleElement = util.findChild(target, 'ons-ripple');

     if (target.hasAttribute('ripple')) {
       if (!rippleElement) {
         target.insertBefore(document.createElement('ons-ripple'), target.firstChild);
       }
     } else if (rippleElement) {
       rippleElement.remove();
     }
   };

   util.animationOptionsParse = parse;

   util.isInteger = function (value) {
     return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
   };

   var Event$1;
   var Utils;
   var Detection;
   var PointerEvent;

   var GestureDetector = function GestureDetector(element, options) {
     return new GestureDetector.Instance(element, options || {});
   };

   GestureDetector.defaults = {
     behavior: {
       touchAction: 'pan-y',
       touchCallout: 'none',
       contentZooming: 'none',
       userDrag: 'none',
       tapHighlightColor: 'rgba(0,0,0,0)'
     }
   };

   GestureDetector.DOCUMENT = document;

   GestureDetector.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled;

   GestureDetector.HAS_TOUCHEVENTS = 'ontouchstart' in window;

   GestureDetector.IS_MOBILE = /mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent);

   GestureDetector.NO_MOUSEEVENTS = GestureDetector.HAS_TOUCHEVENTS && GestureDetector.IS_MOBILE || GestureDetector.HAS_POINTEREVENTS;

   GestureDetector.CALCULATE_INTERVAL = 25;

   var EVENT_TYPES = {};

   var DIRECTION_DOWN = GestureDetector.DIRECTION_DOWN = 'down';
   var DIRECTION_LEFT = GestureDetector.DIRECTION_LEFT = 'left';
   var DIRECTION_UP = GestureDetector.DIRECTION_UP = 'up';
   var DIRECTION_RIGHT = GestureDetector.DIRECTION_RIGHT = 'right';

   var POINTER_MOUSE = GestureDetector.POINTER_MOUSE = 'mouse';
   var POINTER_TOUCH = GestureDetector.POINTER_TOUCH = 'touch';
   var POINTER_PEN = GestureDetector.POINTER_PEN = 'pen';

   var EVENT_START = GestureDetector.EVENT_START = 'start';
   var EVENT_MOVE = GestureDetector.EVENT_MOVE = 'move';
   var EVENT_END = GestureDetector.EVENT_END = 'end';
   var EVENT_RELEASE = GestureDetector.EVENT_RELEASE = 'release';
   var EVENT_TOUCH = GestureDetector.EVENT_TOUCH = 'touch';

   GestureDetector.READY = false;

   GestureDetector.plugins = GestureDetector.plugins || {};

   GestureDetector.gestures = GestureDetector.gestures || {};

   function setup() {
     if (GestureDetector.READY) {
       return;
     }

     Event$1.determineEventTypes();

     Utils.each(GestureDetector.gestures, function (gesture) {
       Detection.register(gesture);
     });

     Event$1.onTouch(GestureDetector.DOCUMENT, EVENT_MOVE, Detection.detect);
     Event$1.onTouch(GestureDetector.DOCUMENT, EVENT_END, Detection.detect);

     GestureDetector.READY = true;
   }

   Utils = GestureDetector.utils = {
     extend: function extend(dest, src, merge) {
       for (var key in src) {
         if (src.hasOwnProperty(key) && (dest[key] === undefined || !merge)) {
           dest[key] = src[key];
         }
       }
       return dest;
     },

     on: function on(element, type, handler) {
       element.addEventListener(type, handler, false);
     },

     off: function off(element, type, handler) {
       element.removeEventListener(type, handler, false);
     },

     each: function each(obj, iterator, context) {
       var i, len;

       if ('forEach' in obj) {
         obj.forEach(iterator, context);
       } else if (obj.length !== undefined) {
           for (i = 0, len = obj.length; i < len; i++) {
             if (iterator.call(context, obj[i], i, obj) === false) {
               return;
             }
           }
         } else {
             for (i in obj) {
               if (obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj) === false) {
                 return;
               }
             }
           }
     },

     inStr: function inStr(src, find) {
       return src.indexOf(find) > -1;
     },

     inArray: function inArray(src, find) {
       if (src.indexOf) {
         var index = src.indexOf(find);
         return index === -1 ? false : index;
       } else {
         for (var i = 0, len = src.length; i < len; i++) {
           if (src[i] === find) {
             return i;
           }
         }
         return false;
       }
     },

     toArray: function toArray(obj) {
       return Array.prototype.slice.call(obj, 0);
     },

     hasParent: function hasParent(node, parent) {
       while (node) {
         if (node == parent) {
           return true;
         }
         node = node.parentNode;
       }
       return false;
     },

     getCenter: function getCenter(touches) {
       var pageX = [],
           pageY = [],
           clientX = [],
           clientY = [],
           min = Math.min,
           max = Math.max;

       if (touches.length === 1) {
         return {
           pageX: touches[0].pageX,
           pageY: touches[0].pageY,
           clientX: touches[0].clientX,
           clientY: touches[0].clientY
         };
       }

       Utils.each(touches, function (touch) {
         pageX.push(touch.pageX);
         pageY.push(touch.pageY);
         clientX.push(touch.clientX);
         clientY.push(touch.clientY);
       });

       return {
         pageX: (min.apply(Math, pageX) + max.apply(Math, pageX)) / 2,
         pageY: (min.apply(Math, pageY) + max.apply(Math, pageY)) / 2,
         clientX: (min.apply(Math, clientX) + max.apply(Math, clientX)) / 2,
         clientY: (min.apply(Math, clientY) + max.apply(Math, clientY)) / 2
       };
     },

     getVelocity: function getVelocity(deltaTime, deltaX, deltaY) {
       return {
         x: Math.abs(deltaX / deltaTime) || 0,
         y: Math.abs(deltaY / deltaTime) || 0
       };
     },

     getAngle: function getAngle(touch1, touch2) {
       var x = touch2.clientX - touch1.clientX,
           y = touch2.clientY - touch1.clientY;

       return Math.atan2(y, x) * 180 / Math.PI;
     },

     getDirection: function getDirection(touch1, touch2) {
       var x = Math.abs(touch1.clientX - touch2.clientX),
           y = Math.abs(touch1.clientY - touch2.clientY);

       if (x >= y) {
         return touch1.clientX - touch2.clientX > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
       }
       return touch1.clientY - touch2.clientY > 0 ? DIRECTION_UP : DIRECTION_DOWN;
     },

     getDistance: function getDistance(touch1, touch2) {
       var x = touch2.clientX - touch1.clientX,
           y = touch2.clientY - touch1.clientY;

       return Math.sqrt(x * x + y * y);
     },

     getScale: function getScale(start, end) {
       if (start.length >= 2 && end.length >= 2) {
         return this.getDistance(end[0], end[1]) / this.getDistance(start[0], start[1]);
       }
       return 1;
     },

     getRotation: function getRotation(start, end) {
       if (start.length >= 2 && end.length >= 2) {
         return this.getAngle(end[1], end[0]) - this.getAngle(start[1], start[0]);
       }
       return 0;
     },

     isVertical: function isVertical(direction) {
       return direction == DIRECTION_UP || direction == DIRECTION_DOWN;
     },

     setPrefixedCss: function setPrefixedCss(element, prop, value, toggle) {
       var prefixes = ['', 'Webkit', 'Moz', 'O', 'ms'];
       prop = Utils.toCamelCase(prop);

       for (var i = 0; i < prefixes.length; i++) {
         var p = prop;
         if (prefixes[i]) {
           p = prefixes[i] + p.slice(0, 1).toUpperCase() + p.slice(1);
         }

         if (p in element.style) {
           element.style[p] = (toggle === null || toggle) && value || '';
           break;
         }
       }
     },

     toggleBehavior: function toggleBehavior(element, props, toggle) {
       if (!props || !element || !element.style) {
         return;
       }

       Utils.each(props, function (value, prop) {
         Utils.setPrefixedCss(element, prop, value, toggle);
       });

       var falseFn = toggle && function () {
         return false;
       };

       if (props.userSelect == 'none') {
         element.onselectstart = falseFn;
       }
       if (props.userDrag == 'none') {
         element.ondragstart = falseFn;
       }
     },

     toCamelCase: function toCamelCase(str) {
       return str.replace(/[_-]([a-z])/g, function (s) {
         return s[1].toUpperCase();
       });
     }
   };

   Event$1 = GestureDetector.event = {
     preventMouseEvents: false,

     started: false,

     shouldDetect: false,

     on: function on(element, type, handler, hook) {
       var types = type.split(' ');
       Utils.each(types, function (type) {
         Utils.on(element, type, handler);
         hook && hook(type);
       });
     },

     off: function off(element, type, handler, hook) {
       var types = type.split(' ');
       Utils.each(types, function (type) {
         Utils.off(element, type, handler);
         hook && hook(type);
       });
     },

     onTouch: function onTouch(element, eventType, handler) {
       var self = this;

       var onTouchHandler = function onTouchHandler(ev) {
         var srcType = ev.type.toLowerCase(),
             isPointer = GestureDetector.HAS_POINTEREVENTS,
             isMouse = Utils.inStr(srcType, 'mouse'),
             triggerType;

         if (isMouse && self.preventMouseEvents) {
           return;

         } else if (isMouse && eventType == EVENT_START && ev.button === 0) {
             self.preventMouseEvents = false;
             self.shouldDetect = true;
           } else if (isPointer && eventType == EVENT_START) {
             self.shouldDetect = ev.buttons === 1 || PointerEvent.matchType(POINTER_TOUCH, ev);
           } else if (!isMouse && eventType == EVENT_START) {
               self.preventMouseEvents = true;
               self.shouldDetect = true;
             }

         if (isPointer && eventType != EVENT_END) {
           PointerEvent.updatePointer(eventType, ev);
         }

         if (self.shouldDetect) {
           triggerType = self.doDetect.call(self, ev, eventType, element, handler);
         }

         if (triggerType == EVENT_END) {
           self.preventMouseEvents = false;
           self.shouldDetect = false;
           PointerEvent.reset();
         }

         if (isPointer && eventType == EVENT_END) {
           PointerEvent.updatePointer(eventType, ev);
         }
       };

       this.on(element, EVENT_TYPES[eventType], onTouchHandler);
       return onTouchHandler;
     },

     doDetect: function doDetect(ev, eventType, element, handler) {
       var touchList = this.getTouchList(ev, eventType);
       var touchListLength = touchList.length;
       var triggerType = eventType;
       var triggerChange = touchList.trigger; // used by fakeMultitouch plugin
       var changedLength = touchListLength;

       if (eventType == EVENT_START) {
         triggerChange = EVENT_TOUCH;
       } else if (eventType == EVENT_END) {
           triggerChange = EVENT_RELEASE;

           changedLength = touchList.length - (ev.changedTouches ? ev.changedTouches.length : 1);
         }

       if (changedLength > 0 && this.started) {
         triggerType = EVENT_MOVE;
       }

       this.started = true;

       var evData = this.collectEventData(element, triggerType, touchList, ev);

       if (eventType != EVENT_END) {
         handler.call(Detection, evData);
       }

       if (triggerChange) {
         evData.changedLength = changedLength;
         evData.eventType = triggerChange;

         handler.call(Detection, evData);

         evData.eventType = triggerType;
         delete evData.changedLength;
       }

       if (triggerType == EVENT_END) {
         handler.call(Detection, evData);

         this.started = false;
       }

       return triggerType;
     },

     determineEventTypes: function determineEventTypes() {
       var types;
       if (GestureDetector.HAS_POINTEREVENTS) {
         if (window.PointerEvent) {
           types = ['pointerdown', 'pointermove', 'pointerup pointercancel lostpointercapture'];
         } else {
           types = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp MSPointerCancel MSLostPointerCapture'];
         }
       } else if (GestureDetector.NO_MOUSEEVENTS) {
         types = ['touchstart', 'touchmove', 'touchend touchcancel'];
       } else {
         types = ['touchstart mousedown', 'touchmove mousemove', 'touchend touchcancel mouseup'];
       }

       EVENT_TYPES[EVENT_START] = types[0];
       EVENT_TYPES[EVENT_MOVE] = types[1];
       EVENT_TYPES[EVENT_END] = types[2];
       return EVENT_TYPES;
     },

     getTouchList: function getTouchList(ev, eventType) {
       if (GestureDetector.HAS_POINTEREVENTS) {
         return PointerEvent.getTouchList();
       }

       if (ev.touches) {
         if (eventType == EVENT_MOVE) {
           return ev.touches;
         }

         var identifiers = [];
         var concat = [].concat(Utils.toArray(ev.touches), Utils.toArray(ev.changedTouches));
         var touchList = [];

         Utils.each(concat, function (touch) {
           if (Utils.inArray(identifiers, touch.identifier) === false) {
             touchList.push(touch);
           }
           identifiers.push(touch.identifier);
         });

         return touchList;
       }

       ev.identifier = 1;
       return [ev];
     },

     collectEventData: function collectEventData(element, eventType, touches, ev) {
       var pointerType = POINTER_TOUCH;
       if (Utils.inStr(ev.type, 'mouse') || PointerEvent.matchType(POINTER_MOUSE, ev)) {
         pointerType = POINTER_MOUSE;
       } else if (PointerEvent.matchType(POINTER_PEN, ev)) {
         pointerType = POINTER_PEN;
       }

       return {
         center: Utils.getCenter(touches),
         timeStamp: Date.now(),
         target: ev.target,
         touches: touches,
         eventType: eventType,
         pointerType: pointerType,
         srcEvent: ev,

         preventDefault: function preventDefault() {
           var srcEvent = this.srcEvent;
           srcEvent.preventManipulation && srcEvent.preventManipulation();
           srcEvent.preventDefault && srcEvent.preventDefault();
         },

         stopPropagation: function stopPropagation() {
           this.srcEvent.stopPropagation();
         },

         stopDetect: function stopDetect() {
           return Detection.stopDetect();
         }
       };
     }
   };

   PointerEvent = GestureDetector.PointerEvent = {
     pointers: {},

     getTouchList: function getTouchList() {
       var touchlist = [];
       Utils.each(this.pointers, function (pointer) {
         touchlist.push(pointer);
       });
       return touchlist;
     },

     updatePointer: function updatePointer(eventType, pointerEvent) {
       if (eventType == EVENT_END || eventType != EVENT_END && pointerEvent.buttons !== 1) {
         delete this.pointers[pointerEvent.pointerId];
       } else {
         pointerEvent.identifier = pointerEvent.pointerId;
         this.pointers[pointerEvent.pointerId] = pointerEvent;
       }
     },

     matchType: function matchType(pointerType, ev) {
       if (!ev.pointerType) {
         return false;
       }

       var pt = ev.pointerType,
           types = {};

       types[POINTER_MOUSE] = pt === (ev.MSPOINTER_TYPE_MOUSE || POINTER_MOUSE);
       types[POINTER_TOUCH] = pt === (ev.MSPOINTER_TYPE_TOUCH || POINTER_TOUCH);
       types[POINTER_PEN] = pt === (ev.MSPOINTER_TYPE_PEN || POINTER_PEN);
       return types[pointerType];
     },

     reset: function resetList() {
       this.pointers = {};
     }
   };

   Detection = GestureDetector.detection = {
     gestures: [],

     current: null,

     previous: null,

     stopped: false,

     startDetect: function startDetect(inst, eventData) {
       if (this.current) {
         return;
       }

       this.stopped = false;

       this.current = {
         inst: inst, // reference to GestureDetectorInstance we're working for
         startEvent: Utils.extend({}, eventData), // start eventData for distances, timing etc
         lastEvent: false, // last eventData
         lastCalcEvent: false, // last eventData for calculations.
         futureCalcEvent: false, // last eventData for calculations.
         lastCalcData: {}, // last lastCalcData
         name: '' // current gesture we're in/detected, can be 'tap', 'hold' etc
       };

       this.detect(eventData);
     },

     detect: function detect(eventData) {
       if (!this.current || this.stopped) {
         return;
       }

       eventData = this.extendEventData(eventData);

       var inst = this.current.inst,
           instOptions = inst.options;

       Utils.each(this.gestures, function triggerGesture(gesture) {
         if (!this.stopped && inst.enabled && instOptions[gesture.name]) {
           gesture.handler.call(gesture, eventData, inst);
         }
       }, this);

       if (this.current) {
         this.current.lastEvent = eventData;
       }

       if (eventData.eventType == EVENT_END) {
         this.stopDetect();
       }

       return eventData; // eslint-disable-line consistent-return
     },

     stopDetect: function stopDetect() {
       this.previous = Utils.extend({}, this.current);

       this.current = null;
       this.stopped = true;
     },

     getCalculatedData: function getCalculatedData(ev, center, deltaTime, deltaX, deltaY) {
       var cur = this.current,
           recalc = false,
           calcEv = cur.lastCalcEvent,
           calcData = cur.lastCalcData;

       if (calcEv && ev.timeStamp - calcEv.timeStamp > GestureDetector.CALCULATE_INTERVAL) {
         center = calcEv.center;
         deltaTime = ev.timeStamp - calcEv.timeStamp;
         deltaX = ev.center.clientX - calcEv.center.clientX;
         deltaY = ev.center.clientY - calcEv.center.clientY;
         recalc = true;
       }

       if (ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
         cur.futureCalcEvent = ev;
       }

       if (!cur.lastCalcEvent || recalc) {
         calcData.velocity = Utils.getVelocity(deltaTime, deltaX, deltaY);
         calcData.angle = Utils.getAngle(center, ev.center);
         calcData.direction = Utils.getDirection(center, ev.center);

         cur.lastCalcEvent = cur.futureCalcEvent || ev;
         cur.futureCalcEvent = ev;
       }

       ev.velocityX = calcData.velocity.x;
       ev.velocityY = calcData.velocity.y;
       ev.interimAngle = calcData.angle;
       ev.interimDirection = calcData.direction;
     },

     extendEventData: function extendEventData(ev) {
       var cur = this.current,
           startEv = cur.startEvent,
           lastEv = cur.lastEvent || startEv;

       if (ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
         startEv.touches = [];
         Utils.each(ev.touches, function (touch) {
           startEv.touches.push({
             clientX: touch.clientX,
             clientY: touch.clientY
           });
         });
       }

       var deltaTime = ev.timeStamp - startEv.timeStamp,
           deltaX = ev.center.clientX - startEv.center.clientX,
           deltaY = ev.center.clientY - startEv.center.clientY;

       this.getCalculatedData(ev, lastEv.center, deltaTime, deltaX, deltaY);

       Utils.extend(ev, {
         startEvent: startEv,

         deltaTime: deltaTime,
         deltaX: deltaX,
         deltaY: deltaY,

         distance: Utils.getDistance(startEv.center, ev.center),
         angle: Utils.getAngle(startEv.center, ev.center),
         direction: Utils.getDirection(startEv.center, ev.center),
         scale: Utils.getScale(startEv.touches, ev.touches),
         rotation: Utils.getRotation(startEv.touches, ev.touches)
       });

       return ev;
     },

     register: function register(gesture) {
       var options = gesture.defaults || {};
       if (options[gesture.name] === undefined) {
         options[gesture.name] = true;
       }

       Utils.extend(GestureDetector.defaults, options, true);

       gesture.index = gesture.index || 1000;

       this.gestures.push(gesture);

       this.gestures.sort(function (a, b) {
         if (a.index < b.index) {
           return -1;
         }
         if (a.index > b.index) {
           return 1;
         }
         return 0;
       });

       return this.gestures;
     }
   };

   GestureDetector.Instance = function (element, options) {
     var self = this;

     setup();

     this.element = element;

     this.enabled = true;

     Utils.each(options, function (value, name) {
       delete options[name];
       options[Utils.toCamelCase(name)] = value;
     });

     this.options = Utils.extend(Utils.extend({}, GestureDetector.defaults), options || {});

     if (this.options.behavior) {
       Utils.toggleBehavior(this.element, this.options.behavior, true);
     }

     this.eventStartHandler = Event$1.onTouch(element, EVENT_START, function (ev) {
       if (self.enabled && ev.eventType == EVENT_START) {
         Detection.startDetect(self, ev);
       } else if (ev.eventType == EVENT_TOUCH) {
         Detection.detect(ev);
       }
     });

     this.eventHandlers = [];
   };

   GestureDetector.Instance.prototype = {
     on: function onEvent(gestures, handler) {
       var self = this;
       Event$1.on(self.element, gestures, handler, function (type) {
         self.eventHandlers.push({ gesture: type, handler: handler });
       });
       return self;
     },

     off: function offEvent(gestures, handler) {
       var self = this;

       Event$1.off(self.element, gestures, handler, function (type) {
         var index = Utils.inArray({ gesture: type, handler: handler });
         if (index !== false) {
           self.eventHandlers.splice(index, 1);
         }
       });
       return self;
     },

     trigger: function triggerEvent(gesture, eventData) {
       if (!eventData) {
         eventData = {};
       }

       var event = GestureDetector.DOCUMENT.createEvent('Event');
       event.initEvent(gesture, true, true);
       event.gesture = eventData;

       var element = this.element;
       if (Utils.hasParent(eventData.target, element)) {
         element = eventData.target;
       }

       element.dispatchEvent(event);
       return this;
     },

     enable: function enable(state) {
       this.enabled = state;
       return this;
     },

     dispose: function dispose() {
       var i, eh;

       Utils.toggleBehavior(this.element, this.options.behavior, false);

       for (i = -1; eh = this.eventHandlers[++i];) {
         Utils.off(this.element, eh.gesture, eh.handler);
       }

       this.eventHandlers = [];

       Event$1.off(this.element, EVENT_TYPES[EVENT_START], this.eventStartHandler);

       return null;
     }
   };

   (function (name) {
     var triggered = false;

     function dragGesture(ev, inst) {
       var cur = Detection.current;

       if (inst.options.dragMaxTouches > 0 && ev.touches.length > inst.options.dragMaxTouches) {
         return;
       }

       switch (ev.eventType) {
         case EVENT_START:
           triggered = false;
           break;

         case EVENT_MOVE:
           if (ev.distance < inst.options.dragMinDistance && cur.name != name) {
             return;
           }

           var startCenter = cur.startEvent.center;

           if (cur.name != name) {
             cur.name = name;
             if (inst.options.dragDistanceCorrection && ev.distance > 0) {
               var factor = Math.abs(inst.options.dragMinDistance / ev.distance);
               startCenter.pageX += ev.deltaX * factor;
               startCenter.pageY += ev.deltaY * factor;
               startCenter.clientX += ev.deltaX * factor;
               startCenter.clientY += ev.deltaY * factor;

               ev = Detection.extendEventData(ev);
             }
           }

           if (cur.lastEvent.dragLockToAxis || inst.options.dragLockToAxis && inst.options.dragLockMinDistance <= ev.distance) {
             ev.dragLockToAxis = true;
           }

           var lastDirection = cur.lastEvent.direction;
           if (ev.dragLockToAxis && lastDirection !== ev.direction) {
             if (Utils.isVertical(lastDirection)) {
               ev.direction = ev.deltaY < 0 ? DIRECTION_UP : DIRECTION_DOWN;
             } else {
               ev.direction = ev.deltaX < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
             }
           }

           if (!triggered) {
             inst.trigger(name + 'start', ev);
             triggered = true;
           }

           inst.trigger(name, ev);
           inst.trigger(name + ev.direction, ev);

           var isVertical = Utils.isVertical(ev.direction);

           if (inst.options.dragBlockVertical && isVertical || inst.options.dragBlockHorizontal && !isVertical) {
             ev.preventDefault();
           }
           break;

         case EVENT_RELEASE:
           if (triggered && ev.changedLength <= inst.options.dragMaxTouches) {
             inst.trigger(name + 'end', ev);
             triggered = false;
           }
           break;

         case EVENT_END:
           triggered = false;
           break;
       }
     }

     GestureDetector.gestures.Drag = {
       name: name,
       index: 50,
       handler: dragGesture,
       defaults: {
         dragMinDistance: 10,

         dragDistanceCorrection: true,

         dragMaxTouches: 1,

         dragBlockHorizontal: false,

         dragBlockVertical: false,

         dragLockToAxis: false,

         dragLockMinDistance: 25
       }
     };
   })('drag');

   GestureDetector.gestures.Gesture = {
     name: 'gesture',
     index: 1337,
     handler: function releaseGesture(ev, inst) {
       inst.trigger(this.name, ev);
     }
   };

   (function (name) {
     var timer;

     function holdGesture(ev, inst) {
       var options = inst.options,
           current = Detection.current;

       switch (ev.eventType) {
         case EVENT_START:
           clearTimeout(timer);

           current.name = name;

           timer = setTimeout(function () {
             if (current && current.name == name) {
               inst.trigger(name, ev);
             }
           }, options.holdTimeout);
           break;

         case EVENT_MOVE:
           if (ev.distance > options.holdThreshold) {
             clearTimeout(timer);
           }
           break;

         case EVENT_RELEASE:
           clearTimeout(timer);
           break;
       }
     }

     GestureDetector.gestures.Hold = {
       name: name,
       index: 10,
       defaults: {
         holdTimeout: 500,

         holdThreshold: 2
       },
       handler: holdGesture
     };
   })('hold');

   GestureDetector.gestures.Release = {
     name: 'release',
     index: Infinity,
     handler: function releaseGesture(ev, inst) {
       if (ev.eventType == EVENT_RELEASE) {
         inst.trigger(this.name, ev);
       }
     }
   };

   GestureDetector.gestures.Swipe = {
     name: 'swipe',
     index: 40,
     defaults: {
       swipeMinTouches: 1,

       swipeMaxTouches: 1,

       swipeVelocityX: 0.6,

       swipeVelocityY: 0.6
     },

     handler: function swipeGesture(ev, inst) {
       if (ev.eventType == EVENT_RELEASE) {
         var touches = ev.touches.length,
             options = inst.options;

         if (touches < options.swipeMinTouches || touches > options.swipeMaxTouches) {
           return;
         }

         if (ev.velocityX > options.swipeVelocityX || ev.velocityY > options.swipeVelocityY) {
           inst.trigger(this.name, ev);
           inst.trigger(this.name + ev.direction, ev);
         }
       }
     }
   };

   (function (name) {
     var hasMoved = false;

     function tapGesture(ev, inst) {
       var options = inst.options,
           current = Detection.current,
           prev = Detection.previous,
           sincePrev,
           didDoubleTap;

       switch (ev.eventType) {
         case EVENT_START:
           hasMoved = false;
           break;

         case EVENT_MOVE:
           hasMoved = hasMoved || ev.distance > options.tapMaxDistance;
           break;

         case EVENT_END:
           if (!Utils.inStr(ev.srcEvent.type, 'cancel') && ev.deltaTime < options.tapMaxTime && !hasMoved) {
             sincePrev = prev && prev.lastEvent && ev.timeStamp - prev.lastEvent.timeStamp;
             didDoubleTap = false;

             if (prev && prev.name == name && sincePrev && sincePrev < options.doubleTapInterval && 
              ev.distance < options.doubleTapDistance) {
               inst.trigger('doubletap', ev);
               didDoubleTap = true;
             }

             if (!didDoubleTap || options.tapAlways) {
               current.name = name;
               inst.trigger(current.name, ev);
             }
           }
           break;
       }
     }

     GestureDetector.gestures.Tap = {
       name: name,
       index: 100,
       handler: tapGesture,
       defaults: {
         tapMaxTime: 250,

         tapMaxDistance: 10,

         tapAlways: true,

         doubleTapDistance: 20,

         doubleTapInterval: 300
       }
     };
   })('tap');

   GestureDetector.gestures.Touch = {
     name: 'touch',
     index: -Infinity,
     defaults: {
       preventDefault: false,

       preventMouse: false
     },
     handler: function touchGesture(ev, inst) {
       if (inst.options.preventMouse && ev.pointerType == POINTER_MOUSE) {
         ev.stopDetect();
         return;
       }

       if (inst.options.preventDefault) {
         ev.preventDefault();
       }

       if (ev.eventType == EVENT_TOUCH) {
         inst.trigger('touch', ev);
       }
     }
   };

   (function (name) {
     var triggered = false;

     function transformGesture(ev, inst) {
       switch (ev.eventType) {
         case EVENT_START:
           triggered = false;
           break;

         case EVENT_MOVE:
           if (ev.touches.length < 2) {
             return;
           }

           var scaleThreshold = Math.abs(1 - ev.scale);
           var rotationThreshold = Math.abs(ev.rotation);

           if (scaleThreshold < inst.options.transformMinScale && rotationThreshold < inst.options.transformMinRotation) {
             return;
           }

           Detection.current.name = name;

           if (!triggered) {
             inst.trigger(name + 'start', ev);
             triggered = true;
           }

           inst.trigger(name, ev); // basic transform event

           if (rotationThreshold > inst.options.transformMinRotation) {
             inst.trigger('rotate', ev);
           }

           if (scaleThreshold > inst.options.transformMinScale) {
             inst.trigger('pinch', ev);
             inst.trigger('pinch' + (ev.scale < 1 ? 'in' : 'out'), ev);
           }
           break;

         case EVENT_RELEASE:
           if (triggered && ev.changedLength < 2) {
             inst.trigger(name + 'end', ev);
             triggered = false;
           }
           break;
       }
     }

     GestureDetector.gestures.Transform = {
       name: name,
       index: 45,
       defaults: {
         transformMinScale: 0.01,

         transformMinRotation: 1
       },

       handler: transformGesture
     };
   })('transform');

   var Platform = function () {
     function Platform() {
       babelHelpers.classCallCheck(this, Platform);

       this._renderPlatform = null;
     }

     babelHelpers.createClass(Platform, [{
       key: 'select',
       value: function select(platform) {
         if (typeof platform === 'string') {
           this._renderPlatform = platform.trim().toLowerCase();
         }
       }
     }, {
       key: 'isWebView',
       value: function isWebView() {
         if (document.readyState === 'loading' || document.readyState == 'uninitialized') {
           throw new Error('isWebView() method is available after dom contents loaded.');
         }

         return !!(window.cordova || window.phonegap || window.PhoneGap);
       }
     }, {
       key: 'isIOS',
       value: function isIOS() {
         if (this._renderPlatform) {
           return this._renderPlatform === 'ios';
         } else if ((typeof device === 'undefined' ? 'undefined' : babelHelpers.typeof(device)) === 'object' && 
          !/browser/i.test(device.platform)) {
           return (/iOS/i.test(device.platform));
         } else {
           return (/iPhone|iPad|iPod/i.test(navigator.userAgent));
         }
       }
     }, {
       key: 'isAndroid',
       value: function isAndroid() {
         if (this._renderPlatform) {
           return this._renderPlatform === 'android';
         } else if ((typeof device === 'undefined' ? 'undefined' : babelHelpers.typeof(device)) === 'object' && 
          !/browser/i.test(device.platform)) {
           return (/Android/i.test(device.platform));
         } else {
           return (/Android/i.test(navigator.userAgent));
         }
       }
     }, {
       key: 'isAndroidPhone',
       value: function isAndroidPhone() {
         return (/Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent));
       }
     }, {
       key: 'isAndroidTablet',
       value: function isAndroidTablet() {
         return (/Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent));
       }
     }, {
       key: 'isWP',
       value: function isWP() {
         if (this._renderPlatform) {
           return this._renderPlatform === 'wp';
         } else if ((typeof device === 'undefined' ? 'undefined' : babelHelpers.typeof(device)) === 'object' && 
          !/browser/i.test(device.platform)) {
           return (/Win32NT|WinCE/i.test(device.platform));
         } else {
           return (/Windows Phone|IEMobile|WPDesktop/i.test(navigator.userAgent));
         }
       }
     }, {
       key: 'isIPhone',
       value: function isIPhone() {
         return (/iPhone/i.test(navigator.userAgent));
       }
     }, {
       key: 'isIPad',
       value: function isIPad() {
         return (/iPad/i.test(navigator.userAgent));
       }
     }, {
       key: 'isIPod',
       value: function isIPod() {
         return (/iPod/i.test(navigator.userAgent));
       }
     }, {
       key: 'isBlackBerry',
       value: function isBlackBerry() {
         if (this._renderPlatform) {
           return this._renderPlatform === 'blackberry';
         } else if ((typeof device === 'undefined' ? 'undefined' : babelHelpers.typeof(device)) === 'object' && 
          !/browser/i.test(device.platform)) {
           return (/BlackBerry/i.test(device.platform));
         } else {
           return (/BlackBerry|RIM Tablet OS|BB10/i.test(navigator.userAgent));
         }
       }
     }, {
       key: 'isOpera',
       value: function isOpera() {
         if (this._renderPlatform) {
           return this._renderPlatform === 'opera';
         } else {
           return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
         }
       }
     }, {
       key: 'isFirefox',
       value: function isFirefox() {
         if (this._renderPlatform) {
           return this._renderPlatform === 'firefox';
         } else {
           return typeof InstallTrigger !== 'undefined';
         }
       }
     }, {
       key: 'isSafari',
       value: function isSafari() {
         if (this._renderPlatform) {
           return this._renderPlatform === 'safari';
         } else {
           return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
         }
       }
     }, {
       key: 'isChrome',
       value: function isChrome() {
         if (this._renderPlatform) {
           return this._renderPlatform === 'chrome';
         } else {
           return !!window.chrome && !(!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) && 
            !(navigator.userAgent.indexOf(' Edge/') >= 0);
         }
       }
     }, {
       key: 'isIE',
       value: function isIE() {
         if (this._renderPlatform) {
           return this._renderPlatform === 'ie';
         } else {
           return false || !!document.documentMode;
         }
       }
     }, {
       key: 'isEdge',
       value: function isEdge() {
         if (this._renderPlatform) {
           return this._renderPlatform === 'edge';
         } else {
           return navigator.userAgent.indexOf(' Edge/') >= 0;
         }
       }
     }, {
       key: 'isIOS7above',
       value: function isIOS7above() {
         if ((typeof device === 'undefined' ? 'undefined' : babelHelpers.typeof(device)) === 'object' && 
          !/browser/i.test(device.platform)) {
           return (/iOS/i.test(device.platform) && parseInt(device.version.split('.')[0]) >= 7
           );
         } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
           var ver = (navigator.userAgent.match(/\b[0-9]+_[0-9]+(?:_[0-9]+)?\b/) || [''])[0].replace(/_/g, '.');
           return parseInt(ver.split('.')[0]) >= 7;
         }
         return false;
       }
     }, {
       key: 'getMobileOS',
       value: function getMobileOS() {
         if (this.isAndroid()) {
           return 'android';
         } else if (this.isIOS()) {
           return 'ios';
         } else if (this.isWP()) {
           return 'wp';
         } else {
           return 'other';
         }
       }
     }, {
       key: 'getIOSDevice',
       value: function getIOSDevice() {
         if (this.isIPhone()) {
           return 'iphone';
         } else if (this.isIPad()) {
           return 'ipad';
         } else if (this.isIPod()) {
           return 'ipod';
         } else {
           return 'na';
         }
       }
     }]);
     return Platform;
   }();

   var platform = new Platform();

   var readyMap = new WeakMap();
   var queueMap = new WeakMap();

   function isContentReady(element) {
     if (element.childNodes.length > 0) {
       setContentReady(element);
     }
     return readyMap.has(element);
   }

   function setContentReady(element) {
     readyMap.set(element, true);
   }

   function addCallback(element, fn) {
     if (!queueMap.has(element)) {
       queueMap.set(element, []);
     }
     queueMap.get(element).push(fn);
   }

   function consumeQueue(element) {
     var callbacks = queueMap.get(element, []) || [];
     queueMap.delete(element);
     callbacks.forEach(function (callback) {
       return callback();
     });
   }

   function contentReady(element) {
     var fn = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

     addCallback(element, fn);

     if (isContentReady(element)) {
       consumeQueue(element);
       return;
     }

     var observer = new MutationObserver(function (changes) {
       setContentReady(element);
       consumeQueue(element);
     });
     observer.observe(element, { childList: true, characterData: true });

     setImmediate(function () {
       setContentReady(element);
       consumeQueue(element);
     });
   }

   var notification = {};

   notification._createAlertDialog = function (title, message, buttonLabels, primaryButtonIndex, modifier, animation, 
    id, _callback, messageIsHTML, cancelable, promptDialog, autofocus, placeholder, defaultValue, submitOnEnter, compile) {
     compile = compile || function (object) {
       return object;
     };

     var titleElementHTML = typeof title === 'string' ? '<div class="alert-dialog-title"></div>' : '';

     var dialogElement = document.createElement('ons-alert-dialog');

     innerHTML(dialogElement, '' + titleElementHTML + '<div class="alert-dialog-content"></div>' +
        '<div class="alert-dialog-footer"></div>');

     contentReady(dialogElement);

     if (id) {
       dialogElement.setAttribute('id', id);
     }

     var titleElement = dialogElement.querySelector('.alert-dialog-title');
     var messageElement = dialogElement.querySelector('.alert-dialog-content');
     var footerElement = dialogElement.querySelector('.alert-dialog-footer');
     var inputElement = void 0;
     var result = {};

     result.promise = new Promise(function (resolve, reject) {
       result.resolve = resolve;
       result.reject = reject;
     });

     modifier = modifier || dialogElement.getAttribute('modifier');

     if (typeof title === 'string') {
       titleElement.textContent = title;
     }

     titleElement = null;

     dialogElement.setAttribute('animation', animation);

     if (messageIsHTML) {
       innerHTML(messageElement, message);
     } else {
       messageElement.textContent = message;
     }

     if (promptDialog) {
       inputElement = util.createElement('<input class="text-input text-input--underbar" type="text"></input>');

       if (modifier) {
         inputElement.classList.add('text-input--' + modifier);
       }

       inputElement.setAttribute('placeholder', placeholder);
       inputElement.value = defaultValue;
       inputElement.style.width = '100%';
       inputElement.style.marginTop = '10px';

       messageElement.appendChild(inputElement);

       if (submitOnEnter) {
         inputElement.addEventListener('keypress', function (event) {
           if (event.keyCode === 13) {
             dialogElement.hide({
               callback: function callback() {
                 _callback(inputElement.value);
                 result.resolve(inputElement.value);
                 dialogElement.remove();
                 dialogElement = null;
               }
             });
           }
         }, false);
       }
     }

     document.body.appendChild(dialogElement);

     compile(dialogElement);

     if (buttonLabels.length <= 2) {
       footerElement.classList.add('alert-dialog-footer--one');
     }

     var createButton = function createButton(i) {
       var buttonElement = util.createElement('<button class="alert-dialog-button"></button>');
       buttonElement.appendChild(document.createTextNode(buttonLabels[i]));

       if (i == primaryButtonIndex) {
         buttonElement.classList.add('alert-dialog-button--primal');
       }

       if (buttonLabels.length <= 2) {
         buttonElement.classList.add('alert-dialog-button--one');
       }

       var onClick = function onClick() {
         buttonElement.removeEventListener('click', onClick, false);

         dialogElement.hide({
           callback: function callback() {
             if (promptDialog) {
               _callback(inputElement.value);
               result.resolve(inputElement.value);
             } else {
               _callback(i);
               result.resolve(i);
             }
             dialogElement.remove();
             dialogElement = inputElement = buttonElement = null;
           }
         });
       };

       buttonElement.addEventListener('click', onClick, false);
       footerElement.appendChild(buttonElement);
     };

     for (var i = 0; i < buttonLabels.length; i++) {
       createButton(i);
     }

     if (cancelable) {
       dialogElement.cancelable = true;
       dialogElement.addEventListener('dialog-cancel', function () {
         if (promptDialog) {
           _callback(null);
           result.reject(null);
         } else {
           _callback(-1);
           result.reject(-1);
         }
         setTimeout(function () {
           dialogElement.remove();
           dialogElement = null;
           inputElement = null;
         });
       }, false);
     }

     setImmediate(function () {
       dialogElement.show({
         callback: function callback() {
           if (inputElement && promptDialog && autofocus) {
             inputElement.focus();
           }
         }
       });
     });

     messageElement = footerElement = null;

     if (modifier) {
       dialogElement.setAttribute('modifier', '');
       dialogElement.setAttribute('modifier', modifier);
     }

     return result.promise;
   };

   notification._alertOriginal = function (message) {
     var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

     typeof message === 'string' ? options.message = message : options = message;

     var defaults = {
       buttonLabel: 'OK',
       animation: 'default',
       title: 'Alert',
       callback: function callback() {}
     };

     options = util.extend({}, defaults, options);
     if (!options.message && !options.messageHTML) {
       throw new Error('Alert dialog must contain a message.');
     }

     return notification._createAlertDialog(options.title, options.message || options.messageHTML, [options.buttonLabel], 
      0, options.modifier, options.animation, options.id, options.callback, !options.message ? true : false, false, false, 
      false, '', '', false, options.compile);
   };

   notification.alert = notification._alertOriginal;

   notification._confirmOriginal = function (message) {
     var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

     typeof message === 'string' ? options.message = message : options = message;

     var defaults = {
       buttonLabels: ['Cancel', 'OK'],
       primaryButtonIndex: 1,
       animation: 'default',
       title: 'Confirm',
       callback: function callback() {},
       cancelable: false
     };

     options = util.extend({}, defaults, options);

     if (!options.message && !options.messageHTML) {
       throw new Error('Confirm dialog must contain a message.');
     }

     return notification._createAlertDialog(options.title, options.message || options.messageHTML, options.buttonLabels, 
      options.primaryButtonIndex, options.modifier, options.animation, options.id, options.callback, 
      !options.message ? true : false, options.cancelable, false, false, '', '', false, options.compile);
   };

   notification.confirm = notification._confirmOriginal;

   notification._promptOriginal = function (message) {
     var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

     typeof message === 'string' ? options.message = message : options = message;

     var defaults = {
       buttonLabel: 'OK',
       animation: 'default',
       title: 'Alert',
       defaultValue: '',
       placeholder: '',
       callback: function callback() {},
       cancelable: false,
       autofocus: true,
       submitOnEnter: true
     };

     options = util.extend({}, defaults, options);
     if (!options.message && !options.messageHTML) {
       throw new Error('Prompt dialog must contain a message.');
     }

     return notification._createAlertDialog(options.title, options.message || options.messageHTML, [options.buttonLabel], 0, 
      options.modifier, options.animation, options.id, options.callback, !options.message ? true : false, options.cancelable, 
      true, options.autofocus, options.placeholder, options.defaultValue, options.submitOnEnter, options.compile);
   };

   notification.prompt = notification._promptOriginal;

   var pageAttributeExpression = {
     _variables: {},

     defineVariable: function defineVariable(name, value) {
       var overwrite = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

       if (typeof name !== 'string') {
         throw new Error('Variable name must be a string.');
       } else if (typeof value !== 'string' && typeof value !== 'function') {
         throw new Error('Variable value must be a string or a function.');
       } else if (this._variables.hasOwnProperty(name) && !overwrite) {
         throw new Error('"' + name + '" is already defined.');
       }
       this._variables[name] = value;
     },

     getVariable: function getVariable(name) {
       if (!this._variables.hasOwnProperty(name)) {
         return null;
       }

       return this._variables[name];
     },

     removeVariable: function removeVariable(name) {
       delete this._variables[name];
     },

     getAllVariables: function getAllVariables() {
       return this._variables;
     },
     _parsePart: function _parsePart(part) {
       var c = void 0,
           inInterpolation = false,
           currentIndex = 0;

       var tokens = [];

       if (part.length === 0) {
         throw new Error('Unable to parse empty string.');
       }

       for (var i = 0; i < part.length; i++) {
         c = part.charAt(i);

         if (c === '$' && part.charAt(i + 1) === '{') {
           if (inInterpolation) {
             throw new Error('Nested interpolation not supported.');
           }

           var token = part.substring(currentIndex, i);
           if (token.length > 0) {
             tokens.push(part.substring(currentIndex, i));
           }

           currentIndex = i;
           inInterpolation = true;
         } else if (c === '}') {
           if (!inInterpolation) {
             throw new Error('} must be preceeded by ${');
           }

           var _token = part.substring(currentIndex, i + 1);
           if (_token.length > 0) {
             tokens.push(part.substring(currentIndex, i + 1));
           }

           currentIndex = i + 1;
           inInterpolation = false;
         }
       }

       if (inInterpolation) {
         throw new Error('Unterminated interpolation.');
       }

       tokens.push(part.substring(currentIndex, part.length));

       return tokens;
     },
     _replaceToken: function _replaceToken(token) {
       var re = /^\${(.*?)}$/,
           match = token.match(re);

       if (match) {
         var name = match[1].trim();
         var variable = this.getVariable(name);

         if (variable === null) {
           throw new Error('Variable "' + name + '" does not exist.');
         } else if (typeof variable === 'string') {
           return variable;
         } else {
           var rv = variable();

           if (typeof rv !== 'string') {
             throw new Error('Must return a string.');
           }

           return rv;
         }
       } else {
         return token;
       }
     },
     _replaceTokens: function _replaceTokens(tokens) {
       return tokens.map(this._replaceToken.bind(this));
     },
     _parseExpression: function _parseExpression(expression) {
       return expression.split(',').map(function (part) {
         return part.trim();
       }).map(this._parsePart.bind(this)).map(this._replaceTokens.bind(this)).map(function (part) {
         return part.join('');
       });
     },

     evaluate: function evaluate(expression) {
       if (!expression) {
         return [];
       }

       return this._parseExpression(expression);
     }
   };

   pageAttributeExpression.defineVariable('mobileOS', platform.getMobileOS());
   pageAttributeExpression.defineVariable('iOSDevice', platform.getIOSDevice());
   pageAttributeExpression.defineVariable('runtime', function () {
     return platform.isWebView() ? 'cordova' : 'browser';
   });

   var internal = {};

   internal.config = {
     autoStatusBarFill: true,
     animationsDisabled: false
   };

   internal.nullElement = window.document.createElement('div');

   internal.isEnabledAutoStatusBarFill = function () {
     return !!internal.config.autoStatusBarFill;
   };

   internal.normalizePageHTML = function (html) {
     html = ('' + html).trim();

     if (!html.match(/^<ons-page/)) {
       html = '<ons-page _muted>' + html + '</ons-page>';
     }

     return html;
   };

   internal.waitDOMContentLoaded = function (callback) {
     if (window.document.readyState === 'loading' || window.document.readyState == 'uninitialized') {
       window.document.addEventListener('DOMContentLoaded', callback);
     } else {
       setImmediate(callback);
     }
   };

   internal.autoStatusBarFill = function (action) {
     var onReady = function onReady() {
       if (internal.shouldFillStatusBar()) {
         action();
       }
       document.removeEventListener('deviceready', onReady);
       document.removeEventListener('DOMContentLoaded', onReady);
     };

     if ((typeof device === 'undefined' ? 'undefined' : babelHelpers.typeof(device)) === 'object') {
       document.addEventListener('deviceready', onReady);
     } else if (['complete', 'interactive'].indexOf(document.readyState) === -1) {
       document.addEventListener('DOMContentLoaded', function () {
         onReady();
       });
     } else {
       onReady();
     }
   };

   internal.shouldFillStatusBar = function () {
     return internal.isEnabledAutoStatusBarFill() && platform.isWebView() && platform.isIOS7above();
   };

   internal.templateStore = {
     _storage: {},

     get: function get(key) {
       return internal.templateStore._storage[key] || null;
     },

     set: function set(key, template) {
       internal.templateStore._storage[key] = template;
     }
   };

   window.document.addEventListener('_templateloaded', function (e) {
     if (e.target.nodeName.toLowerCase() === 'ons-template') {
       internal.templateStore.set(e.templateId, e.template);
     }
   }, false);

   window.document.addEventListener('DOMContentLoaded', function () {
     register('script[type="text/ons-template"]');
     register('script[type="text/template"]');
     register('script[type="text/ng-template"]');

     function register(query) {
       var templates = window.document.querySelectorAll(query);
       for (var i = 0; i < templates.length; i++) {
         internal.templateStore.set(templates[i].getAttribute('id'), templates[i].textContent);
       }
     }
   }, false);

   internal.getTemplateHTMLAsync = function (page) {
     return new Promise(function (resolve, reject) {
       setImmediate(function () {
         var cache = internal.templateStore.get(page);

         if (cache) {
           var html = typeof cache === 'string' ? cache : cache[1];
           resolve(html);
         } else {
           (function () {
             var xhr = new XMLHttpRequest();
             xhr.open('GET', page, true);
             xhr.onload = function (response) {
               var html = xhr.responseText;
               if (xhr.status >= 400 && xhr.status < 600) {
                 reject(html);
               } else {
                 resolve(html);
               }
             };
             xhr.onerror = function () {
               throw new Error('The page is not found: ' + page);
             };
             xhr.send(null);
           })();
         }
       });
     });
   };

   internal.getPageHTMLAsync = function (page) {
     var pages = pageAttributeExpression.evaluate(page);

     var getPage = function getPage(page) {
       if (typeof page !== 'string') {
         return Promise.reject('Must specify a page.');
       }

       return internal.getTemplateHTMLAsync(page).then(function (html) {
         return internal.normalizePageHTML(html);
       }, function (error) {
         if (pages.length === 0) {
           return Promise.reject(error);
         }

         return getPage(pages.shift());
       }).then(function (html) {
         return internal.normalizePageHTML(html);
       });
     };

     return getPage(pages.shift());
   };

   var AnimatorFactory = function () {
     function AnimatorFactory(opts) {
       babelHelpers.classCallCheck(this, AnimatorFactory);

       this._animators = opts.animators;
       this._baseClass = opts.baseClass;
       this._baseClassName = opts.baseClassName || opts.baseClass.name;
       this._animation = opts.defaultAnimation || 'default';
       this._animationOptions = opts.defaultAnimationOptions || {};

       if (!this._animators[this._animation]) {
         throw new Error('No such animation: ' + this._animation);
       }
     }

     babelHelpers.createClass(AnimatorFactory, [{
       key: 'setAnimationOptions',

       value: function setAnimationOptions(options) {
         this._animationOptions = options;
       }
     }, {
       key: 'newAnimator',
       value: function newAnimator() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
         var defaultAnimator = arguments[1];

         var animator = null;

         if (options.animation instanceof this._baseClass) {
           return options.animation;
         }

         var Animator = null;

         if (typeof options.animation === 'string') {
           Animator = this._animators[options.animation];
         }

         if (!Animator && defaultAnimator) {
           animator = defaultAnimator;
         } else {
           Animator = Animator || this._animators[this._animation];

           var animationOpts = util.extend({}, this._animationOptions, options.animationOptions || {}, 
            internal.config.animationsDisabled ? { duration: 0, delay: 0 } : {});

           animator = new Animator(animationOpts);

           if (typeof animator === 'function') {
             animator = new animator(animationOpts); // eslint-disable-line new-cap
           }
         }

         if (!(animator instanceof this._baseClass)) {
           throw new Error('"animator" is not an instance of ' + this._baseClassName + '.');
         }

         return animator;
       }
     }], [{
       key: 'parseAnimationOptionsString',
       value: function parseAnimationOptionsString(jsonString) {
         try {
           if (typeof jsonString === 'string') {
             var result = util.animationOptionsParse(jsonString);
             if ((typeof result === 'undefined' ? 'undefined' : babelHelpers.typeof(result)) === 'object' && result !== null) {
               return result;
             } else {
               console.error('"animation-options" attribute must be a JSON object string: ' + jsonString);
             }
           }
           return {};
         } catch (e) {
           console.error('"animation-options" attribute must be a JSON object string: ' + jsonString);
           return {};
         }
       }
     }]);
     return AnimatorFactory;
   }();

   var ModifierUtil = function () {
     function ModifierUtil() {
       babelHelpers.classCallCheck(this, ModifierUtil);
     }

     babelHelpers.createClass(ModifierUtil, null, [{
       key: 'diff',

       value: function diff(last, current) {
         last = makeDict(('' + last).trim());
         current = makeDict(('' + current).trim());

         var removed = Object.keys(last).reduce(function (result, token) {
           if (!current[token]) {
             result.push(token);
           }
           return result;
         }, []);

         var added = Object.keys(current).reduce(function (result, token) {
           if (!last[token]) {
             result.push(token);
           }
           return result;
         }, []);

         return { added: added, removed: removed };

         function makeDict(modifier) {
           var dict = {};
           ModifierUtil.split(modifier).forEach(function (token) {
             return dict[token] = token;
           });
           return dict;
         }
       }
     }, {
       key: 'applyDiffToClassList',
       value: function applyDiffToClassList(diff, classList, template) {
         diff.added.map(function (modifier) {
           return template.replace(/\*/g, modifier);
         }).forEach(function (klass) {
           return classList.add(klass);
         });

         diff.removed.map(function (modifier) {
           return template.replace(/\*/g, modifier);
         }).forEach(function (klass) {
           return classList.remove(klass);
         });
       }
     }, {
       key: 'applyDiffToElement',
       value: function applyDiffToElement(diff, element, scheme) {
         var matches = function matches(e, s) {
           return (e.matches || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector).call(e, s);
         };
         for (var selector in scheme) {
           if (scheme.hasOwnProperty(selector)) {
             var targetElements = !selector || matches(element, selector) ? [element] : element.querySelectorAll(selector);
             for (var i = 0; i < targetElements.length; i++) {
               ModifierUtil.applyDiffToClassList(diff, targetElements[i].classList, scheme[selector]);
             }
           }
         }
       }
     }, {
       key: 'onModifierChanged',
       value: function onModifierChanged(last, current, element, scheme) {
         return ModifierUtil.applyDiffToElement(ModifierUtil.diff(last, current), element, scheme);
       }
     }, {
       key: 'initModifier',
       value: function initModifier(element, scheme) {
         var modifier = element.getAttribute('modifier');
         if (typeof modifier !== 'string') {
           return;
         }

         ModifierUtil.applyDiffToElement({
           removed: [],
           added: ModifierUtil.split(modifier)
         }, element, scheme);
       }
     }, {
       key: 'split',
       value: function split(modifier) {
         if (typeof modifier !== 'string') {
           return [];
         }

         return modifier.trim().split(/ +/).filter(function (token) {
           return token !== '';
         });
       }
     }]);
     return ModifierUtil;
   }();

   var LazyRepeatDelegate = function () {
     function LazyRepeatDelegate(userDelegate) {
       var templateElement = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
       babelHelpers.classCallCheck(this, LazyRepeatDelegate);

       if ((typeof userDelegate === 'undefined' ? 'undefined' : babelHelpers.typeof(userDelegate)) !== 'object' || 
        userDelegate === null) {
         throw Error('"delegate" parameter must be an object.');
       }
       this._userDelegate = userDelegate;

       if (!(templateElement instanceof Element) && templateElement !== null) {
         throw Error('"templateElement" parameter must be an instance of Element or null.');
       }
       this._templateElement = templateElement;
     }

     babelHelpers.createClass(LazyRepeatDelegate, [{
       key: 'hasRenderFunction',

       value: function hasRenderFunction() {
         return this._userDelegate._render instanceof Function;
       }
     }, {
       key: '_render',
       value: function _render(items, height) {
         this._userDelegate._render(items, height);
       }
     }, {
       key: 'loadItemElement',
       value: function loadItemElement(index, parent, done) {
         if (this._userDelegate.loadItemElement instanceof Function) {
           this._userDelegate.loadItemElement(index, parent, function (element) {
             return done({ element: element });
           });
         } else {
           var element = this._userDelegate.createItemContent(index, this._templateElement);
           if (!(element instanceof Element)) {
             throw Error('createItemContent() must return an instance of Element.');
           }
           parent.appendChild(element);
           done({ element: element });
         }
       }
     }, {
       key: 'countItems',
       value: function countItems() {
         var count = this._userDelegate.countItems();
         if (typeof count !== 'number') {
           throw Error('countItems() must return a number.');
         }
         return count;
       }
     }, {
       key: 'updateItem',
       value: function updateItem(index, item) {
         if (this._userDelegate.updateItemContent instanceof Function) {
           this._userDelegate.updateItemContent(index, item);
         }
       }
     }, {
       key: 'calculateItemHeight',
       value: function calculateItemHeight(index) {
         if (this._userDelegate.calculateItemHeight instanceof Function) {
           var height = this._userDelegate.calculateItemHeight(index);

           if (typeof height !== 'number') {
             throw Error('calculateItemHeight() must return a number.');
           }

           return height;
         }

         return 0;
       }
     }, {
       key: 'destroyItem',
       value: function destroyItem(index, item) {
         if (this._userDelegate.destroyItem instanceof Function) {
           this._userDelegate.destroyItem(index, item);
         }
       }
     }, {
       key: 'destroy',
       value: function destroy() {
         if (this._userDelegate.destroy instanceof Function) {
           this._userDelegate.destroy();
         }

         this._userDelegate = this._templateElement = null;
       }
     }, {
       key: 'itemHeight',
       get: function get() {
         return this._userDelegate.itemHeight;
       }
     }]);
     return LazyRepeatDelegate;
   }();

   var LazyRepeatProvider = function () {
     function LazyRepeatProvider(wrapperElement, delegate) {
       babelHelpers.classCallCheck(this, LazyRepeatProvider);

       if (!(delegate instanceof LazyRepeatDelegate)) {
         throw Error('"delegate" parameter must be an instance of LazyRepeatDelegate.');
       }

       this._wrapperElement = wrapperElement;
       this._delegate = delegate;

       if (wrapperElement.tagName.toLowerCase() === 'ons-list') {
         wrapperElement.classList.add('lazy-list');
       }

       this._pageContent = this._findPageContentElement(wrapperElement);

       if (!this._pageContent) {
         throw new Error('ons-lazy-repeat must be a descendant of an <ons-page> or an element.');
       }

       this._topPositions = [];
       this._renderedItems = {};

       if (!this._delegate.itemHeight && !this._delegate.calculateItemHeight(0)) {
         this._unknownItemHeight = true;
       }
       this._addEventListeners();
       this._onChange();
     }

     babelHelpers.createClass(LazyRepeatProvider, [{
       key: '_findPageContentElement',
       value: function _findPageContentElement(wrapperElement) {
         var pageContent = util.findParent(wrapperElement, '.page__content');

         if (pageContent) {
           return pageContent;
         }

         var page = util.findParent(wrapperElement, 'ons-page');
         if (page) {
           var content = util.findChild(page, '.content');
           if (content) {
             return content;
           }
         }

         return null;
       }
     }, {
       key: '_checkItemHeight',
       value: function _checkItemHeight(callback) {
         var _this = this;

         this._delegate.loadItemElement(0, this._wrapperElement, function (item) {
           if (!_this._unknownItemHeight) {
             throw Error('Invalid state');
           }

           var done = function done() {
             _this._wrapperElement.removeChild(item.element);
             delete _this._unknownItemHeight;
             callback();
           };

           _this._itemHeight = item.element.offsetHeight;

           if (_this._itemHeight > 0) {
             done();
             return;
           }

           var lastVisibility = _this._wrapperElement.style.visibility;
           _this._wrapperElement.style.visibility = 'hidden';
           item.element.style.visibility = 'hidden';

           setImmediate(function () {
             _this._itemHeight = item.element.offsetHeight;
             if (_this._itemHeight == 0) {
               throw Error('Invalid state: this._itemHeight must be greater than zero.');
             }
             _this._wrapperElement.style.visibility = lastVisibility;
             done();
           });
         });
       }
     }, {
       key: '_countItems',
       value: function _countItems() {
         return this._delegate.countItems();
       }
     }, {
       key: '_getItemHeight',
       value: function _getItemHeight(i) {
         return this.staticItemHeight || this._delegate.calculateItemHeight(i);
       }
     }, {
       key: '_onChange',
       value: function _onChange() {
         this._render();
       }
     }, {
       key: 'refresh',
       value: function refresh() {
         this._removeAllElements();
         this._onChange();
       }
     }, {
       key: '_render',
       value: function _render() {
         var _this2 = this;

         if (this._unknownItemHeight) {
           return this._checkItemHeight(this._render.bind(this));
         }

         var items = this._getItemsInView();

         if (this._delegate.hasRenderFunction && this._delegate.hasRenderFunction()) {
           this._delegate._render(items, this._listHeight);
           return null;
         }

         var keep = {};

         items.forEach(function (item) {
           _this2._renderElement(item);
           keep[item.index] = true;
         });

         Object.keys(this._renderedItems).forEach(function (key) {
           return keep[key] || _this2._removeElement(key);
         });

         this._wrapperElement.style.height = this._listHeight + 'px';
       }
     }, {
       key: '_renderElement',
       value: function _renderElement(_ref) {
         var _this3 = this;

         var index = _ref.index;
         var top = _ref.top;

         var item = this._renderedItems[index];
         if (item) {
           this._delegate.updateItem(index, item); // update if it exists
           item.element.style.top = top + 'px';
           return;
         }

         this._delegate.loadItemElement(index, this._wrapperElement, function (item) {
           util.extend(item.element.style, {
             position: 'absolute',
             top: top + 'px',
             left: 0,
             right: 0
           });

           _this3._renderedItems[index] = item;
         });
       }
     }, {
       key: '_removeElement',
       value: function _removeElement(index) {
         var item = this._renderedItems[index];

         this._delegate.destroyItem(index, item);

         if (item.element.parentElement) {
           item.element.parentElement.removeChild(item.element);
         }

         delete this._renderedItems[index];
       }
     }, {
       key: '_removeAllElements',
       value: function _removeAllElements() {
         var _this4 = this;

         Object.keys(this._renderedItems).forEach(function (key) {
           return _this4._removeElement(key);
         });
       }
     }, {
       key: '_calculateStartIndex',
       value: function _calculateStartIndex(current) {
         var start = 0;
         var end = this._itemCount - 1;

         if (this.staticItemHeight) {
           return parseInt(-current / this.staticItemHeight);
         }

         for (;;) {
           var middle = Math.floor((start + end) / 2);
           var value = current + this._topPositions[middle];

           if (end < start) {
             return 0;
           } else if (value <= 0 && value + this._getItemHeight(middle) > 0) {
             return middle;
           } else if (isNaN(value) || value >= 0) {
             end = middle - 1;
           } else {
             start = middle + 1;
           }
         }
       }
     }, {
       key: '_recalculateTopPositions',
       value: function _recalculateTopPositions() {
         var l = Math.min(this._topPositions.length, this._itemCount);
         this._topPositions[0] = 0;
         for (var i = 1, _l; i < _l; i++) {
           this._topPositions[i] = this._topPositions[i - 1] + this._getItemHeight(i);
         }
       }
     }, {
       key: '_getItemsInView',
       value: function _getItemsInView() {
         var offset = this._wrapperElement.getBoundingClientRect().top;
         var limit = 4 * window.innerHeight - offset;
         var count = this._countItems();

         if (count !== this._itemCount) {
           this._itemCount = count;
           this._recalculateTopPositions();
         }

         var i = Math.max(0, this._calculateStartIndex(offset) - 30);

         var items = [];
         for (var top = this._topPositions[i]; i < count && top < limit; i++) {
           if (i >= this._topPositions.length) {
             this._topPositions.length += 100;
           }

           this._topPositions[i] = top;
           items.push({ top: top, index: i });
           top += this._getItemHeight(i);
         }
         this._listHeight = top;

         return items;
       }
     }, {
       key: '_debounce',
       value: function _debounce(func, wait, immediate) {
         var timeout = void 0;
         return function () {
           var _this5 = this,
               _arguments = arguments;

           var callNow = immediate && !timeout;
           clearTimeout(timeout);
           if (callNow) {
             func.apply(this, arguments);
           } else {
             timeout = setTimeout(function () {
               timeout = null;
               func.apply(_this5, _arguments);
             }, wait);
           }
         };
       }
     }, {
       key: '_doubleFireOnTouchend',
       value: function _doubleFireOnTouchend() {
         this._render();
         this._debounce(this._render.bind(this), 100);
       }
     }, {
       key: '_addEventListeners',
       value: function _addEventListeners() {
         util.bindListeners(this, ['_onChange', '_doubleFireOnTouchend']);

         if (platform.isIOS()) {
           this._boundOnChange = this._debounce(this._boundOnChange, 30);
         }

         this._pageContent.addEventListener('scroll', this._boundOnChange, true);

         if (platform.isIOS()) {
           this._pageContent.addEventListener('touchmove', this._boundOnChange, true);
           this._pageContent.addEventListener('touchend', this._boundDoubleFireOnTouchend, true);
         }

         window.document.addEventListener('resize', this._boundOnChange, true);
       }
     }, {
       key: '_removeEventListeners',
       value: function _removeEventListeners() {
         this._pageContent.removeEventListener('scroll', this._boundOnChange, true);

         if (platform.isIOS()) {
           this._pageContent.removeEventListener('touchmove', this._boundOnChange, true);
           this._pageContent.removeEventListener('touchend', this._boundDoubleFireOnTouchend, true);
         }

         window.document.removeEventListener('resize', this._boundOnChange, true);
       }
     }, {
       key: 'destroy',
       value: function destroy() {
         this._removeAllElements();
         this._delegate.destroy();
         this._parentElement = this._delegate = this._renderedItems = null;
         this._removeEventListeners();
       }
     }, {
       key: 'staticItemHeight',
       get: function get() {
         return this._delegate.itemHeight || this._itemHeight;
       }
     }]);
     return LazyRepeatProvider;
   }();

   internal.AnimatorFactory = AnimatorFactory;
   internal.ModifierUtil = ModifierUtil;
   internal.LazyRepeatProvider = LazyRepeatProvider;
   internal.LazyRepeatDelegate = LazyRepeatDelegate;

   var create = function create() {
     var obj = {
       _isPortrait: false,

       isPortrait: function isPortrait() {
         return this._isPortrait();
       },

       isLandscape: function isLandscape() {
         return !this.isPortrait();
       },

       _init: function _init() {
         document.addEventListener('DOMContentLoaded', this._onDOMContentLoaded.bind(this), false);

         if ('orientation' in window) {
           window.addEventListener('orientationchange', this._onOrientationChange.bind(this), false);
         } else {
           window.addEventListener('resize', this._onResize.bind(this), false);
         }

         this._isPortrait = function () {
           return window.innerHeight > window.innerWidth;
         };

         return this;
       },

       _onDOMContentLoaded: function _onDOMContentLoaded() {
         this._installIsPortraitImplementation();
         this.emit('change', { isPortrait: this.isPortrait() });
       },

       _installIsPortraitImplementation: function _installIsPortraitImplementation() {
         var isPortrait = window.innerWidth < window.innerHeight;

         if (!('orientation' in window)) {
           this._isPortrait = function () {
             return window.innerHeight > window.innerWidth;
           };
         } else if (window.orientation % 180 === 0) {
           this._isPortrait = function () {
             return Math.abs(window.orientation % 180) === 0 ? isPortrait : !isPortrait;
           };
         } else {
           this._isPortrait = function () {
             return Math.abs(window.orientation % 180) === 90 ? isPortrait : !isPortrait;
           };
         }
       },

       _onOrientationChange: function _onOrientationChange() {
         var _this = this;

         var isPortrait = this._isPortrait();

         var nIter = 0;
         var interval = setInterval(function () {
           nIter++;

           var w = window.innerWidth;
           var h = window.innerHeight;

           if (isPortrait && w <= h || !isPortrait && w >= h) {
             _this.emit('change', { isPortrait: isPortrait });
             clearInterval(interval);
           } else if (nIter === 50) {
             _this.emit('change', { isPortrait: isPortrait });
             clearInterval(interval);
           }
         }, 20);
       },

       _onResize: function _onResize() {
         this.emit('change', { isPortrait: this.isPortrait() });
       }
     };

     MicroEvent.mixin(obj);

     return obj;
   };

   var orientation = create()._init();

   var softwareKeyboard = new MicroEvent();
   softwareKeyboard._visible = false;

   var onShow = function onShow() {
     softwareKeyboard._visible = true;
     softwareKeyboard.emit('show');
   };

   var onHide = function onHide() {
     softwareKeyboard._visible = false;
     softwareKeyboard.emit('hide');
   };

   var bindEvents = function bindEvents() {
     if (typeof Keyboard !== 'undefined') {
       Keyboard.onshow = onShow;
       Keyboard.onhide = onHide;
       softwareKeyboard.emit('init', { visible: Keyboard.isVisible });

       return true;
     } else if (typeof cordova.plugins !== 'undefined' && typeof cordova.plugins.Keyboard !== 'undefined') {
       window.addEventListener('native.keyboardshow', onShow);
       window.addEventListener('native.keyboardhide', onHide);
       softwareKeyboard.emit('init', { visible: cordova.plugins.Keyboard.isVisible });

       return true;
     }

     return false;
   };

   var noPluginError = function noPluginError() {
     console.warn('ons-keyboard: Cordova Keyboard plugin is not present.');
   };

   document.addEventListener('deviceready', function () {
     if (!bindEvents()) {
       if (document.querySelector('[ons-keyboard-active]') || document.querySelector('[ons-keyboard-inactive]')) {
         noPluginError();
       }

       softwareKeyboard.on = noPluginError;
     }
   });

   var util$1 = {
     _ready: false,

     _domContentLoaded: false,

     _onDOMContentLoaded: function _onDOMContentLoaded() {
       util$1._domContentLoaded = true;

       if (platform.isWebView()) {
         window.document.addEventListener('deviceready', function () {
           util$1._ready = true;
         }, false);
       } else {
         util$1._ready = true;
       }
     },

     addBackButtonListener: function addBackButtonListener(fn) {
       if (!this._domContentLoaded) {
         throw new Error('This method is available after DOMContentLoaded');
       }

       if (this._ready) {
         window.document.addEventListener('backbutton', fn, false);
       } else {
         window.document.addEventListener('deviceready', function () {
           window.document.addEventListener('backbutton', fn, false);
         });
       }
     },

     removeBackButtonListener: function removeBackButtonListener(fn) {
       if (!this._domContentLoaded) {
         throw new Error('This method is available after DOMContentLoaded');
       }

       if (this._ready) {
         window.document.removeEventListener('backbutton', fn, false);
       } else {
         window.document.addEventListener('deviceready', function () {
           window.document.removeEventListener('backbutton', fn, false);
         });
       }
     }
   };
   window.addEventListener('DOMContentLoaded', function () {
     return util$1._onDOMContentLoaded();
   }, false);

   var HandlerRepository = {
     _store: {},

     _genId: function () {
       var i = 0;
       return function () {
         return i++;
       };
     }(),

     set: function set(element, handler) {
       if (element.dataset.deviceBackButtonHandlerId) {
         this.remove(element);
       }
       var id = element.dataset.deviceBackButtonHandlerId = HandlerRepository._genId();
       this._store[id] = handler;
     },

     remove: function remove(element) {
       if (element.dataset.deviceBackButtonHandlerId) {
         delete this._store[element.dataset.deviceBackButtonHandlerId];
         delete element.dataset.deviceBackButtonHandlerId;
       }
     },

     get: function get(element) {
       if (!element.dataset.deviceBackButtonHandlerId) {
         return undefined;
       }

       var id = element.dataset.deviceBackButtonHandlerId;

       if (!this._store[id]) {
         throw new Error();
       }

       return this._store[id];
     },

     has: function has(element) {
       if (!element.dataset) {
         return false;
       }

       var id = element.dataset.deviceBackButtonHandlerId;

       return !!this._store[id];
     }
   };

   var DeviceBackButtonDispatcher = function () {
     function DeviceBackButtonDispatcher() {
       babelHelpers.classCallCheck(this, DeviceBackButtonDispatcher);

       this._isEnabled = false;
       this._boundCallback = this._callback.bind(this);
     }

     babelHelpers.createClass(DeviceBackButtonDispatcher, [{
       key: 'enable',
       value: function enable() {
         if (!this._isEnabled) {
           util$1.addBackButtonListener(this._boundCallback);
           this._isEnabled = true;
         }
       }
     }, {
       key: 'disable',
       value: function disable() {
         if (this._isEnabled) {
           util$1.removeBackButtonListener(this._boundCallback);
           this._isEnabled = false;
         }
       }
     }, {
       key: 'fireDeviceBackButtonEvent',
       value: function fireDeviceBackButtonEvent() {
         var event = document.createEvent('Event');
         event.initEvent('backbutton', true, true);
         document.dispatchEvent(event);
       }
     }, {
       key: '_callback',
       value: function _callback() {
         this._dispatchDeviceBackButtonEvent();
       }
     }, {
       key: 'createHandler',
       value: function createHandler(element, callback) {
         if (!(element instanceof HTMLElement)) {
           throw new Error('element must be an instance of HTMLElement');
         }

         if (!(callback instanceof Function)) {
           throw new Error('callback must be an instance of Function');
         }

         var handler = {
           _callback: callback,
           _element: element,

           disable: function disable() {
             HandlerRepository.remove(element);
           },

           setListener: function setListener(callback) {
             this._callback = callback;
           },

           enable: function enable() {
             HandlerRepository.set(element, this);
           },

           isEnabled: function isEnabled() {
             return HandlerRepository.get(element) === this;
           },

           destroy: function destroy() {
             HandlerRepository.remove(element);
             this._callback = this._element = null;
           }
         };

         handler.enable();

         return handler;
       }
     }, {
       key: '_dispatchDeviceBackButtonEvent',
       value: function _dispatchDeviceBackButtonEvent() {
         var tree = this._captureTree();

         var element = this._findHandlerLeafElement(tree);

         var handler = HandlerRepository.get(element);
         handler._callback(createEvent(element));

         function createEvent(element) {
           return {
             _element: element,
             callParentHandler: function callParentHandler() {
               var parent = this._element.parentNode;

               while (parent) {
                 handler = HandlerRepository.get(parent);
                 if (handler) {
                   return handler._callback(createEvent(parent));
                 }
                 parent = parent.parentNode;
               }
             }
           };
         }
       }
     }, {
       key: '_captureTree',
       value: function _captureTree() {
         return createTree(document.body);

         function createTree(element) {
           return {
             element: element,
             children: Array.prototype.concat.apply([], arrayOf(element.children).map(function (childElement) {
               if (childElement.style.display === 'none') {
                 return [];
               }

               if (childElement.children.length === 0 && !HandlerRepository.has(childElement)) {
                 return [];
               }

               var result = createTree(childElement);

               if (result.children.length === 0 && !HandlerRepository.has(result.element)) {
                 return [];
               }

               return [result];
             }))
           };
         }

         function arrayOf(target) {
           var result = [];
           for (var i = 0; i < target.length; i++) {
             result.push(target[i]);
           }
           return result;
         }
       }
     }, {
       key: '_findHandlerLeafElement',
       value: function _findHandlerLeafElement(tree) {
         return find(tree);

         function find(node) {
           if (node.children.length === 0) {
             return node.element;
           }

           if (node.children.length === 1) {
             return find(node.children[0]);
           }

           return node.children.map(function (childNode) {
             return childNode.element;
           }).reduce(function (left, right) {
             if (!left) {
               return right;
             }

             var leftZ = parseInt(window.getComputedStyle(left, '').zIndex, 10);
             var rightZ = parseInt(window.getComputedStyle(right, '').zIndex, 10);

             if (!isNaN(leftZ) && !isNaN(rightZ)) {
               return leftZ > rightZ ? left : right;
             }

             throw new Error('Capturing backbutton-handler is failure.');
           }, null);
         }
       }
     }]);
     return DeviceBackButtonDispatcher;
   }();

   var deviceBackButtonDispatcher = new DeviceBackButtonDispatcher();

   var autoStyleEnabled = true;

   var modifiersMap = {
     'quiet': 'material--flat',
     'light': 'material--flat',
     'outline': 'material--flat',
     'cta': '',
     'large--quiet': 'material--flat large',
     'large--cta': 'large',
     'noborder': '',
     'chevron': '',
     'tappable': ''
   };

   var platforms = {};

   platforms.android = function (element) {
     if (!/ons-fab|ons-speed-dial|ons-progress/.test(element.tagName.toLowerCase()) && 
       !/material/.test(element.getAttribute('modifier'))) {
       var oldModifier = element.getAttribute('modifier') || '';

       var newModifier = oldModifier.trim().split(/\s+/).map(function (e) {
         return modifiersMap.hasOwnProperty(e) ? modifiersMap[e] : e;
       });
       newModifier.unshift('material');

       element.setAttribute('modifier', newModifier.join(' ').trim());
     }

     if (/ons-button|ons-list-item|ons-fab|ons-speed-dial|ons-tab$/.test(element.tagName.toLowerCase()) && 
      !element.hasAttribute('ripple') && !util.findChild(element, 'ons-ripple')) {
       if (element.tagName.toLowerCase() === 'ons-list-item') {
         if (element.hasAttribute('tappable')) {
           element.setAttribute('ripple', '');
           element.removeAttribute('tappable');
         }
       } else {
         element.setAttribute('ripple', '');
       }
     }
   };

   platforms.ios = function (element) {
     if (/material/.test(element.getAttribute('modifier'))) {
       util.removeModifier(element, 'material');

       if (util.removeModifier(element, 'material--flat')) {
         util.addModifier(element, util.removeModifier(element, 'large') ? 'large--quiet' : 'quiet');
       }

       if (!element.getAttribute('modifier')) {
         element.removeAttribute('modifier');
       }
     }

     if (element.hasAttribute('ripple')) {
       if (element.tagName.toLowerCase() === 'ons-list-item') {
         element.setAttribute('tappable', '');
       }

       element.removeAttribute('ripple');
     }
   };

   var unlocked = {
     android: true
   };

   var prepareAutoStyle = function prepareAutoStyle(element, force) {
     if (autoStyleEnabled && !element.hasAttribute('disable-auto-styling')) {
       var mobileOS = platform.getMobileOS();
       if (platforms.hasOwnProperty(mobileOS) && (unlocked.hasOwnProperty(mobileOS) || force)) {
         platforms[mobileOS](element);
       }
     }
   };

   var autoStyle = {
     isEnabled: function isEnabled() {
       return autoStyleEnabled;
     },
     enable: function enable() {
       return autoStyleEnabled = true;
     },
     disable: function disable() {
       return autoStyleEnabled = false;
     },
     prepare: prepareAutoStyle
   };

   var generateId = function () {
     var i = 0;
     return function () {
       return i++;
     };
   }();

   var DoorLock = function () {
     function DoorLock() {
       var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
       babelHelpers.classCallCheck(this, DoorLock);

       this._lockList = [];
       this._waitList = [];
       this._log = options.log || function () {};
     }

     babelHelpers.createClass(DoorLock, [{
       key: 'lock',
       value: function lock() {
         var _this = this;

         var unlock = function unlock() {
           _this._unlock(unlock);
         };
         unlock.id = generateId();
         this._lockList.push(unlock);
         this._log('lock: ' + unlock.id);

         return unlock;
       }
     }, {
       key: '_unlock',
       value: function _unlock(fn) {
         var index = this._lockList.indexOf(fn);
         if (index === -1) {
           throw new Error('This function is not registered in the lock list.');
         }

         this._lockList.splice(index, 1);
         this._log('unlock: ' + fn.id);

         this._tryToFreeWaitList();
       }
     }, {
       key: '_tryToFreeWaitList',
       value: function _tryToFreeWaitList() {
         while (!this.isLocked() && this._waitList.length > 0) {
           this._waitList.shift()();
         }
       }
     }, {
       key: 'waitUnlock',
       value: function waitUnlock(callback) {
         if (!(callback instanceof Function)) {
           throw new Error('The callback param must be a function.');
         }

         if (this.isLocked()) {
           this._waitList.push(callback);
         } else {
           callback();
         }
       }
     }, {
       key: 'isLocked',
       value: function isLocked() {
         return this._lockList.length > 0;
       }
     }]);
     return DoorLock;
   }();

   function loadPage(_ref, done) {
     var page = _ref.page;
     var parent = _ref.parent;
     var _ref$params = _ref.params;
     var params = _ref$params === undefined ? {} : _ref$params;
     var replace = _ref.replace;

     internal.getPageHTMLAsync(page).then(function (html) {
       if (replace) {
         util.propagateAction(parent, '_destroy');
         parent.innerHTML = '';
       }

       var element = util.createElement(html.trim());
       parent.appendChild(element);

       done({
         element: element,
         unload: function unload() {
           return element.remove();
         }
       });
     });
   }

   var PageLoader = function () {
     function PageLoader(fn) {
       babelHelpers.classCallCheck(this, PageLoader);

       this._loader = fn instanceof Function ? fn : loadPage;
     }

     babelHelpers.createClass(PageLoader, [{
       key: 'load',

       value: function load(_ref2, done) {
         var page = _ref2.page;
         var parent = _ref2.parent;
         var _ref2$params = _ref2.params;
         var params = _ref2$params === undefined ? {} : _ref2$params;
         var replace = _ref2.replace;

         this._loader({ page: page, parent: parent, params: params, replace: replace }, function (result) {
           if (!(result.element instanceof Element)) {
             throw Error('target.element must be an instance of Element.');
           }

           if (!(result.unload instanceof Function)) {
             throw Error('target.unload must be an instance of Function.');
           }

           done(result);
         }, params);
       }
     }, {
       key: 'internalLoader',
       set: function set(fn) {
         if (!(fn instanceof Function)) {
           throw Error('First parameter must be an instance of Function');
         }
         this._loader = fn;
       },
       get: function get() {
         return this._loader;
       }
     }]);
     return PageLoader;
   }();

   var defaultPageLoader = new PageLoader();

   var instantPageLoader = new PageLoader(function (_ref3, done) {
     var page = _ref3.page;
     var parent = _ref3.parent;
     var _ref3$params = _ref3.params;
     var params = _ref3$params === undefined ? {} : _ref3$params;
     var replace = _ref3.replace;

     if (replace) {
       util.propagateAction(parent, '_destroy');
       parent.innerHTML = '';
     }

     var element = util.createElement(page.trim());
     parent.appendChild(element);

     done({
       element: element,
       unload: function unload() {
         return element.remove();
       }
     });
   });

   var ons = {};

   ons._util = util;
   ons._deviceBackButtonDispatcher = deviceBackButtonDispatcher;
   ons._internal = internal;
   ons.GestureDetector = GestureDetector;
   ons.platform = platform;
   ons.softwareKeyboard = softwareKeyboard;
   ons.pageAttributeExpression = pageAttributeExpression;
   ons.orientation = orientation;
   ons.notification = notification;
   ons._animationOptionsParser = parse;
   ons._autoStyle = autoStyle;
   ons._DoorLock = DoorLock;
   ons._contentReady = contentReady;
   ons.defaultPageLoader = defaultPageLoader;
   ons.PageLoader = PageLoader;

   ons._readyLock = new DoorLock();

   ons.platform.select((window.location.search.match(/platform=([\w-]+)/) || [])[1]);

   waitDeviceReady();

   ons.isReady = function () {
     return !ons._readyLock.isLocked();
   };

   ons.isWebView = ons.platform.isWebView;

   ons.ready = function (callback) {
     if (ons.isReady()) {
       callback();
     } else {
       ons._readyLock.waitUnlock(callback);
     }
   };

   ons.setDefaultDeviceBackButtonListener = function (listener) {
     ons._defaultDeviceBackButtonHandler.setListener(listener);
   };

   ons.disableDeviceBackButtonHandler = function () {
     ons._deviceBackButtonDispatcher.disable();
   };

   ons.enableDeviceBackButtonHandler = function () {
     ons._deviceBackButtonDispatcher.enable();
   };

   ons.enableAutoStatusBarFill = function () {
     if (ons.isReady()) {
       throw new Error('This method must be called before ons.isReady() is true.');
     }
     ons._internal.config.autoStatusBarFill = true;
   };

   ons.disableAutoStatusBarFill = function () {
     if (ons.isReady()) {
       throw new Error('This method must be called before ons.isReady() is true.');
     }
     ons._internal.config.autoStatusBarFill = false;
   };

   ons.disableAnimations = function () {
     ons._internal.config.animationsDisabled = true;
   };

   ons.enableAnimations = function () {
     ons._internal.config.animationsDisabled = false;
   };

   ons.disableAutoStyling = ons._autoStyle.disable;

   ons.enableAutoStyling = ons._autoStyle.enable;

   ons.forcePlatformStyling = function (newPlatform) {
     ons.enableAutoStyling();
     ons.platform.select(newPlatform || 'ios');

     ons._util.arrayFrom(document.querySelectorAll('*')).forEach(function (element) {
       if (element.tagName.toLowerCase() === 'ons-if') {
         element._platformUpdate();
       } else if (element.tagName.match(/^ons-/i)) {
         ons._autoStyle.prepare(element, true);
         if (element.tagName.toLowerCase() === 'ons-tabbar') {
           element._updatePosition();
         }
       }
     });
   };

   ons._createPopoverOriginal = function (page) {
     var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

     if (!page) {
       throw new Error('Page url must be defined.');
     }

     return ons._internal.getPageHTMLAsync(page).then(function (html) {
       html = html.match(/<ons-popover/gi) ? '<div>' + html + '</div>' : '<ons-popover>' + html + '</ons-popover>';
       var div = ons._util.createElement('<div>' + html + '</div>');

       var popover = div.querySelector('ons-popover');
       document.body.appendChild(popover);

       if (options.link instanceof Function) {
         options.link(popover);
       }

       return popover;
     });
   };

   ons.createPopover = ons._createPopoverOriginal;

   ons._createDialogOriginal = function (page) {
     var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

     if (!page) {
       throw new Error('Page url must be defined.');
     }

     return ons._internal.getPageHTMLAsync(page).then(function (html) {
       html = html.match(/<ons-dialog/gi) ? '<div>' + html + '</div>' : '<ons-dialog>' + html + '</ons-dialog>';
       var div = ons._util.createElement('<div>' + html + '</div>');

       var dialog = div.querySelector('ons-dialog');
       document.body.appendChild(dialog);

       if (options.link instanceof Function) {
         options.link(dialog);
       }

       return dialog;
     });
   };

   ons.createDialog = ons._createDialogOriginal;

   ons._createAlertDialogOriginal = function (page) {
     var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

     if (!page) {
       throw new Error('Page url must be defined.');
     }

     return ons._internal.getPageHTMLAsync(page).then(function (html) {
       html = html.match(/<ons-alert-dialog/gi) ? '<div>' + html + '</div>' : '<ons-alert-dialog>' + html + '</ons-alert-dialog>';
       var div = ons._util.createElement('<div>' + html + '</div>');

       var alertDialog = div.querySelector('ons-alert-dialog');
       document.body.appendChild(alertDialog);

       if (options.link instanceof Function) {
         options.link(alertDialog);
       }

       return alertDialog;
     });
   };

   ons.createAlertDialog = ons._createAlertDialogOriginal;

   ons._resolveLoadingPlaceholderOriginal = function (page, link) {
     var elements = ons._util.arrayFrom(window.document.querySelectorAll('[ons-loading-placeholder]'));

     if (elements.length > 0) {
       elements.filter(function (element) {
         return !element.getAttribute('page');
       }).forEach(function (element) {
         element.setAttribute('ons-loading-placeholder', page);
         ons._resolveLoadingPlaceholder(element, page, link);
       });
     } else {
       throw new Error('No ons-loading-placeholder exists.');
     }
   };

   ons.resolveLoadingPlaceholder = ons._resolveLoadingPlaceholderOriginal;

   ons._setupLoadingPlaceHolders = function () {
     ons.ready(function () {
       var elements = ons._util.arrayFrom(window.document.querySelectorAll('[ons-loading-placeholder]'));

       elements.forEach(function (element) {
         var page = element.getAttribute('ons-loading-placeholder');
         if (typeof page === 'string') {
           ons._resolveLoadingPlaceholder(element, page);
         }
       });
     });
   };

   ons._resolveLoadingPlaceholder = function (element, page, link) {
     link = link || function (element, done) {
       done();
     };
     ons._internal.getPageHTMLAsync(page).then(function (html) {
       while (element.firstChild) {
         element.removeChild(element.firstChild);
       }

       var contentElement = ons._util.createElement('<div>' + html + '</div>');
       contentElement.style.display = 'none';

       element.appendChild(contentElement);

       link(contentElement, function () {
         contentElement.style.display = '';
       });
     }).catch(function (error) {
       throw new Error('Unabled to resolve placeholder: ' + error);
     });
   };

   function waitDeviceReady() {
     var unlockDeviceReady = ons._readyLock.lock();
     window.addEventListener('DOMContentLoaded', function () {
       if (ons.isWebView()) {
         window.document.addEventListener('deviceready', unlockDeviceReady, false);
       } else {
         unlockDeviceReady();
       }
     }, false);
   }

   window._superSecretOns = ons;

   function getElementClass() {
     if (typeof HTMLElement !== 'function') {
       var _BaseElement = function _BaseElement() {};
       _BaseElement.prototype = document.createElement('div');
       return _BaseElement;
     } else {
       return HTMLElement;
     }
   }

   var BaseElement = function (_getElementClass) {
     babelHelpers.inherits(BaseElement, _getElementClass);

     function BaseElement(self) {
       var _this, _ret;

       babelHelpers.classCallCheck(this, BaseElement);

       self = (_this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(BaseElement).call(this, self)), _this);
       self.init();
       return _ret = self, babelHelpers.possibleConstructorReturn(_this, _ret);
     }

     babelHelpers.createClass(BaseElement, [{
       key: 'init',
       value: function init() {}
     }]);
     return BaseElement;
   }(getElementClass());

   var TemplateElement = function (_BaseElement) {
     babelHelpers.inherits(TemplateElement, _BaseElement);

     function TemplateElement() {
       babelHelpers.classCallCheck(this, TemplateElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(TemplateElement).apply(this, arguments));
     }

     babelHelpers.createClass(TemplateElement, [{
       key: 'init',

       value: function init() {
         this.template = this.innerHTML;

         while (this.firstChild) {
           this.removeChild(this.firstChild);
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var event = new CustomEvent('_templateloaded', { bubbles: true, cancelable: true });
         event.template = this.template;
         event.templateId = this.getAttribute('id');

         this.dispatchEvent(event);
       }
     }]);
     return TemplateElement;
   }(BaseElement);

   customElements.define('ons-template', TemplateElement);

   var IfElement = function (_BaseElement) {
     babelHelpers.inherits(IfElement, _BaseElement);

     function IfElement() {
       babelHelpers.classCallCheck(this, IfElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(IfElement).apply(this, arguments));
     }

     babelHelpers.createClass(IfElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           if (platform._renderPlatform !== null) {
             _this2._platformUpdate();
           } else if (!_this2._isAllowedPlatform()) {
             while (_this2.childNodes[0]) {
               _this2.childNodes[0].remove();
             }
             _this2._platformUpdate();
           }
         });

         this._onOrientationChange();
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         orientation.on('change', this._onOrientationChange.bind(this));
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name) {
         if (name === 'orientation') {
           this._onOrientationChange();
         }
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         orientation.off('change', this._onOrientationChange);
       }
     }, {
       key: '_platformUpdate',
       value: function _platformUpdate() {
         this.style.display = this._isAllowedPlatform() ? '' : 'none';
       }
     }, {
       key: '_isAllowedPlatform',
       value: function _isAllowedPlatform() {
         return !this.getAttribute('platform') || this.getAttribute('platform').split(/\s+/).indexOf(platform.getMobileOS()) >= 0;
       }
     }, {
       key: '_onOrientationChange',
       value: function _onOrientationChange() {
         if (this.hasAttribute('orientation') && this._isAllowedPlatform()) {
           var conditionalOrientation = this.getAttribute('orientation').toLowerCase();
           var currentOrientation = orientation.isPortrait() ? 'portrait' : 'landscape';

           this.style.display = conditionalOrientation === currentOrientation ? '' : 'none';
         }
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['orientation'];
       }
     }]);
     return IfElement;
   }(BaseElement);

   customElements.define('ons-if', IfElement);

   var AlertDialogAnimator = function () {
     function AlertDialogAnimator() {
       var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

       var _ref$timing = _ref.timing;
       var timing = _ref$timing === undefined ? 'linear' : _ref$timing;
       var _ref$delay = _ref.delay;
       var delay = _ref$delay === undefined ? 0 : _ref$delay;
       var _ref$duration = _ref.duration;
       var duration = _ref$duration === undefined ? 0.2 : _ref$duration;
       babelHelpers.classCallCheck(this, AlertDialogAnimator);

       this.timing = timing;
       this.delay = delay;
       this.duration = duration;
     }

     babelHelpers.createClass(AlertDialogAnimator, [{
       key: 'show',
       value: function show(dialog, done) {
         done();
       }
     }, {
       key: 'hide',
       value: function hide(dialog, done) {
         done();
       }
     }]);
     return AlertDialogAnimator;
   }();

   var AndroidAlertDialogAnimator = function (_AlertDialogAnimator) {
     babelHelpers.inherits(AndroidAlertDialogAnimator, _AlertDialogAnimator);

     function AndroidAlertDialogAnimator() {
       var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

       var _ref2$timing = _ref2.timing;
       var timing = _ref2$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref2$timing;
       var _ref2$duration = _ref2.duration;
       var duration = _ref2$duration === undefined ? 0.2 : _ref2$duration;
       var _ref2$delay = _ref2.delay;
       var delay = _ref2$delay === undefined ? 0 : _ref2$delay;
       babelHelpers.classCallCheck(this, AndroidAlertDialogAnimator);
       return babelHelpers.possibleConstructorReturn(this, 
        Object.getPrototypeOf(AndroidAlertDialogAnimator).call(this, { duration: duration, timing: timing, delay: delay }));
     }

     babelHelpers.createClass(AndroidAlertDialogAnimator, [{
       key: 'show',
       value: function show(dialog, callback) {
         callback = callback ? callback : function () {};

         animit.runAll(animit(dialog._mask).queue({
           opacity: 0
         }).wait(this.delay).queue({
           opacity: 1.0
         }, {
           duration: this.duration,
           timing: this.timing
         }), animit(dialog._dialog).saveStyle().queue({
           css: {
             transform: 'translate3d(-50%, -50%, 0) scale3d(0.9, 0.9, 1.0)',
             opacity: 0.0
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3d(-50%, -50%, 0) scale3d(1.0, 1.0, 1.0)',
             opacity: 1.0
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }, {
       key: 'hide',
       value: function hide(dialog, callback) {
         callback = callback ? callback : function () {};

         animit.runAll(animit(dialog._mask).queue({
           opacity: 1.0
         }).wait(this.delay).queue({
           opacity: 0
         }, {
           duration: this.duration,
           timing: this.timing
         }), animit(dialog._dialog).saveStyle().queue({
           css: {
             transform: 'translate3d(-50%, -50%, 0) scale3d(1.0, 1.0, 1.0)',
             opacity: 1.0
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3d(-50%, -50%, 0) scale3d(0.9, 0.9, 1.0)',
             opacity: 0.0
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }]);
     return AndroidAlertDialogAnimator;
   }(AlertDialogAnimator);

   var IOSAlertDialogAnimator = function (_AlertDialogAnimator2) {
     babelHelpers.inherits(IOSAlertDialogAnimator, _AlertDialogAnimator2);

     function IOSAlertDialogAnimator() {
       var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

       var _ref3$timing = _ref3.timing;
       var timing = _ref3$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref3$timing;
       var _ref3$duration = _ref3.duration;
       var duration = _ref3$duration === undefined ? 0.2 : _ref3$duration;
       var _ref3$delay = _ref3.delay;
       var delay = _ref3$delay === undefined ? 0 : _ref3$delay;
       babelHelpers.classCallCheck(this, IOSAlertDialogAnimator);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(IOSAlertDialogAnimator).call(this, { duration: duration, timing: timing, delay: delay }));
     }

     babelHelpers.createClass(IOSAlertDialogAnimator, [{
       key: 'show',
       value: function show(dialog, callback) {
         callback = callback ? callback : function () {};

         animit.runAll(animit(dialog._mask).queue({
           opacity: 0
         }).wait(this.delay).queue({
           opacity: 1.0
         }, {
           duration: this.duration,
           timing: this.timing
         }), animit(dialog._dialog).saveStyle().queue({
           css: {
             transform: 'translate3d(-50%, -50%, 0) scale3d(1.3, 1.3, 1.0)',
             opacity: 0.0
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3d(-50%, -50%, 0) scale3d(1.0, 1.0, 1.0)',
             opacity: 1.0
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }, {
       key: 'hide',
       value: function hide(dialog, callback) {
         callback = callback ? callback : function () {};

         animit.runAll(animit(dialog._mask).queue({
           opacity: 1.0
         }).wait(this.delay).queue({
           opacity: 0
         }, {
           duration: this.duration,
           timing: this.timing
         }), animit(dialog._dialog).saveStyle().queue({
           css: {
             opacity: 1.0
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             opacity: 0.0
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }]);
     return IOSAlertDialogAnimator;
   }(AlertDialogAnimator);

   var scheme = {
     '.alert-dialog': 'alert-dialog--*',
     '.alert-dialog-container': 'alert-dialog-container--*',
     '.alert-dialog-title': 'alert-dialog-title--*',
     '.alert-dialog-content': 'alert-dialog-content--*',
     '.alert-dialog-footer': 'alert-dialog-footer--*',
     '.alert-dialog-button': 'alert-dialog-button--*',
     '.alert-dialog-footer--one': 'alert-dialog-footer--one--*',
     '.alert-dialog-button--one': 'alert-dialog-button--one--*',
     '.alert-dialog-button--primal': 'alert-dialog-button--primal--*',
     '.alert-dialog-mask': 'alert-dialog-mask--*'
   };

   var _animatorDict = {
     'none': AlertDialogAnimator,
     'default': function _default() {
       return platform.isAndroid() ? AndroidAlertDialogAnimator : IOSAlertDialogAnimator;
     },
     'fade': function fade() {
       return platform.isAndroid() ? AndroidAlertDialogAnimator : IOSAlertDialogAnimator;
     }
   };

   var AlertDialogElement = function (_BaseElement) {
     babelHelpers.inherits(AlertDialogElement, _BaseElement);

     function AlertDialogElement() {
       babelHelpers.classCallCheck(this, AlertDialogElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(AlertDialogElement).apply(this, arguments));
     }

     babelHelpers.createClass(AlertDialogElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           return _this2._compile();
         });

         this._visible = false;
         this._doorLock = new DoorLock();
         this._boundCancel = this._cancel.bind(this);

         this._updateAnimatorFactory();
       }
     }, {
       key: '_updateAnimatorFactory',
       value: function _updateAnimatorFactory() {
         this._animatorFactory = new AnimatorFactory({
           animators: _animatorDict,
           baseClass: AlertDialogAnimator,
           baseClassName: 'AlertDialogAnimator',
           defaultAnimation: this.getAttribute('animation')
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         this.style.display = 'none';

         var content = document.createDocumentFragment();

         if (!this._mask && !this._dialog) {
           while (this.firstChild) {
             content.appendChild(this.firstChild);
           }
         }

         if (!this._mask) {
           var mask = document.createElement('div');
           mask.classList.add('alert-dialog-mask');
           this.insertBefore(mask, this.children[0]);
         }

         if (!this._dialog) {
           var dialog = document.createElement('div');
           dialog.classList.add('alert-dialog');
           this.insertBefore(dialog, null);
         }

         if (!util.findChild(this._dialog, '.alert-dialog-container')) {
           var container = document.createElement('div');
           container.classList.add('alert-dialog-container');
           this._dialog.appendChild(container);
         }

         this._dialog.children[0].appendChild(content);

         this._dialog.style.zIndex = 20001;
         this._mask.style.zIndex = 20000;

         if (this.getAttribute('mask-color')) {
           this._mask.style.backgroundColor = this.getAttribute('mask-color');
         }

         ModifierUtil.initModifier(this, scheme);
       }
     }, {
       key: 'show',

       value: function show() {
         var _this3 = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         var _cancel2 = false;
         var callback = options.callback || function () {};

         options.animationOptions = util.extend(options.animationOptions || {}, 
          AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

         util.triggerElementEvent(this, 'preshow', {
           alertDialog: this,
           cancel: function cancel() {
             _cancel2 = true;
           }
         });

         if (!_cancel2) {
           var _ret = function () {
             var tryShow = function tryShow() {
               var unlock = _this3._doorLock.lock();
               var animator = _this3._animatorFactory.newAnimator(options);

               _this3.style.display = 'block';
               _this3._mask.style.opacity = '1';

               return new Promise(function (resolve) {
                 contentReady(_this3, function () {
                   animator.show(_this3, function () {
                     _this3._visible = true;
                     unlock();

                     util.triggerElementEvent(_this3, 'postshow', { alertDialog: _this3 });

                     callback();
                     resolve(_this3);
                   });
                 });
               });
             };

             return {
               v: new Promise(function (resolve) {
                 _this3._doorLock.waitUnlock(function () {
                   return resolve(tryShow());
                 });
               })
             };
           }();

           if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
         } else {
           return Promise.reject('Canceled in preshow event.');
         }
       }
     }, {
       key: 'hide',
       value: function hide() {
         var _this4 = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         var _cancel3 = false;
         var callback = options.callback || function () {};

         options.animationOptions = util.extend(options.animationOptions || {}, 
          AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

         util.triggerElementEvent(this, 'prehide', {
           alertDialog: this,
           cancel: function cancel() {
             _cancel3 = true;
           }
         });

         if (!_cancel3) {
           var _ret2 = function () {
             var tryHide = function tryHide() {
               var unlock = _this4._doorLock.lock();
               var animator = _this4._animatorFactory.newAnimator(options);

               return new Promise(function (resolve) {
                 contentReady(_this4, function () {
                   animator.hide(_this4, function () {
                     _this4.style.display = 'none';
                     _this4._visible = false;
                     unlock();

                     util.triggerElementEvent(_this4, 'posthide', { alertDialog: _this4 });

                     callback();
                     resolve(_this4);
                   });
                 });
               });
             };

             return {
               v: new Promise(function (resolve) {
                 _this4._doorLock.waitUnlock(function () {
                   return resolve(tryHide());
                 });
               })
             };
           }();

           if ((typeof _ret2 === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret2)) === "object") return _ret2.v;
         } else {
           return Promise.reject('Canceled in prehide event.');
         }
       }
     }, {
       key: '_cancel',
       value: function _cancel() {
         var _this5 = this;

         if (this.cancelable && !this._running) {
           this._running = true;
           this.hide({
             callback: function callback() {
               _this5._running = false;
               util.triggerElementEvent(_this5, 'dialog-cancel');
             }
           });
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var _this6 = this;

         this.onDeviceBackButton = function (e) {
           return _this6.cancelable ? _this6._cancel() : e.callParentHandler();
         };

         contentReady(this, function () {
           _this6._mask.addEventListener('click', _this6._boundCancel, false);
         });
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this._backButtonHandler.destroy();
         this._backButtonHandler = null;

         this._mask.removeEventListener('click', this._boundCancel.bind(this), false);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme);
         } else if (name === 'animation') {
           this._updateAnimatorFactory();
         }
       }
     }, {
       key: '_mask',
       get: function get() {
         return util.findChild(this, '.alert-dialog-mask');
       }
     }, {
       key: '_dialog',
       get: function get() {
         return util.findChild(this, '.alert-dialog');
       }
     }, {
       key: '_titleElement',
       get: function get() {
         return util.findChild(this._dialog.children[0], '.alert-dialog-title');
       }
     }, {
       key: '_contentElement',
       get: function get() {
         return util.findChild(this._dialog.children[0], '.alert-dialog-content');
       }
     }, {
       key: 'disabled',
       set: function set(value) {
         return util.toggleAttribute(this, 'disabled', value);
       },
       get: function get() {
         return this.hasAttribute('disabled');
       }
     }, {
       key: 'cancelable',
       set: function set(value) {
         return util.toggleAttribute(this, 'cancelable', value);
       },
       get: function get() {
         return this.hasAttribute('cancelable');
       }
     }, {
       key: 'visible',
       get: function get() {
         return this._visible;
       }
     }, {
       key: 'onDeviceBackButton',
       get: function get() {
         return this._backButtonHandler;
       },
       set: function set(callback) {
         if (this._backButtonHandler) {
           this._backButtonHandler.destroy();
         }

         this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
       }
     }], [{
       key: 'registerAnimator',
       value: function registerAnimator(name, Animator) {
         if (!(Animator.prototype instanceof AlertDialogAnimator)) {
           throw new Error('"Animator" param must inherit OnsAlertDialogElement.AlertDialogAnimator');
         }
         _animatorDict[name] = Animator;
       }
     }, {
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'animation'];
       }
     }, {
       key: 'AlertDialogAnimator',
       get: function get() {
         return AlertDialogAnimator;
       }
     }]);
     return AlertDialogElement;
   }(BaseElement);

   customElements.define('ons-alert-dialog', AlertDialogElement);

   var scheme$1 = {
     '': 'back-button--*',
     '.back-button__icon': 'back-button--*__icon',
     '.back-button__label': 'back-button--*__label'
   };

   var BackButtonElement = function (_BaseElement) {
     babelHelpers.inherits(BackButtonElement, _BaseElement);

     function BackButtonElement() {
       babelHelpers.classCallCheck(this, BackButtonElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(BackButtonElement).apply(this, arguments));
     }

     babelHelpers.createClass(BackButtonElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           _this2._compile();
         });

         this._options = {};
         this._boundOnClick = this._onClick.bind(this);
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         this.classList.add('back-button');

         if (!util.findChild(this, '.back-button__label')) {
           var label = util.create('span.back-button__label');

           while (this.childNodes[0]) {
             label.appendChild(this.childNodes[0]);
           }
           this.appendChild(label);
         }

         if (!util.findChild(this, '.back-button__icon')) {
           var icon = util.create('span.back-button__icon');

           this.insertBefore(icon, this.children[0]);
         }

         ModifierUtil.initModifier(this, scheme$1);
       }
     }, {
       key: '_onClick',

       value: function _onClick() {
         if (this.onClick) {
           this.onClick.apply(this);
         } else {
           var navigator = util.findParent(this, 'ons-navigator');
           if (navigator) {
             navigator.popPage(this.options);
           }
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this.addEventListener('click', this._boundOnClick, false);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$1);
         }
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this.removeEventListener('click', this._boundOnClick, false);
       }
     }, {
       key: 'show',
       value: function show() {
         this.style.display = 'inline-block';
       }
     }, {
       key: 'hide',
       value: function hide() {
         this.style.display = 'none';
       }
     }, {
       key: 'options',
       get: function get() {
         return this._options;
       },
       set: function set(object) {
         this._options = object;
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier'];
       }
     }]);
     return BackButtonElement;
   }(BaseElement);

   customElements.define('ons-back-button', BackButtonElement);

   var scheme$2 = { '': 'bottom-bar--*' };

   var BottomToolbarElement = function (_BaseElement) {
     babelHelpers.inherits(BottomToolbarElement, _BaseElement);

     function BottomToolbarElement() {
       babelHelpers.classCallCheck(this, BottomToolbarElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(BottomToolbarElement).apply(this, arguments));
     }

     babelHelpers.createClass(BottomToolbarElement, [{
       key: 'init',

       value: function init() {
         this.classList.add('bottom-bar');
         ModifierUtil.initModifier(this, scheme$2);
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         if (util.match(this.parentNode, 'ons-page')) {
           this.parentNode.classList.add('page-with-bottom-toolbar');
         }
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           ModifierUtil.onModifierChanged(last, current, this, scheme$2);
         }
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier'];
       }
     }]);
     return BottomToolbarElement;
   }(BaseElement);

   customElements.define('ons-bottom-toolbar', BottomToolbarElement);

   var scheme$3 = { '': 'button--*' };

   var ButtonElement = function (_BaseElement) {
     babelHelpers.inherits(ButtonElement, _BaseElement);

     function ButtonElement() {
       babelHelpers.classCallCheck(this, ButtonElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ButtonElement).apply(this, arguments));
     }

     babelHelpers.createClass(ButtonElement, [{
       key: 'init',

       value: function init() {
         this._compile();
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         switch (name) {
           case 'modifier':
             ModifierUtil.onModifierChanged(last, current, this, scheme$3);
             break;
           case 'ripple':
             this._updateRipple();
         }
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         this.classList.add('button');

         this._updateRipple();

         ModifierUtil.initModifier(this, scheme$3);
       }
     }, {
       key: '_updateRipple',
       value: function _updateRipple() {
         util.updateRipple(this);
       }
     }, {
       key: 'disabled',
       set: function set(value) {
         return util.toggleAttribute(this, 'disabled', value);
       },
       get: function get() {
         return this.hasAttribute('disabled');
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'ripple'];
       }
     }]);
     return ButtonElement;
   }(BaseElement);

   customElements.define('ons-button', ButtonElement);

   var scheme$4 = { '': 'carousel-item--*' };

   var CarouselItemElement = function (_BaseElement) {
     babelHelpers.inherits(CarouselItemElement, _BaseElement);

     function CarouselItemElement() {
       babelHelpers.classCallCheck(this, CarouselItemElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(CarouselItemElement).apply(this, arguments));
     }

     babelHelpers.createClass(CarouselItemElement, [{
       key: 'init',
       value: function init() {
         this.style.width = '100%';
         ModifierUtil.initModifier(this, scheme$4);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$4);
         }
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier'];
       }
     }]);
     return CarouselItemElement;
   }(BaseElement);

   customElements.define('ons-carousel-item', CarouselItemElement);

   var VerticalModeTrait = {
     _getScrollDelta: function _getScrollDelta(event) {
       return event.gesture.deltaY;
     },

     _getScrollVelocity: function _getScrollVelocity(event) {
       return event.gesture.velocityY;
     },

     _getElementSize: function _getElementSize() {
       if (!this._currentElementSize) {
         this._currentElementSize = this.getBoundingClientRect().height;
       }

       return this._currentElementSize;
     },

     _generateScrollTransform: function _generateScrollTransform(scroll) {
       return 'translate3d(0px, ' + -scroll + 'px, 0px)';
     },

     _updateDimensionData: function _updateDimensionData() {
       this._style = window.getComputedStyle(this);
       this._dimensions = this.getBoundingClientRect();
     },

     _updateOffset: function _updateOffset() {
       if (this.centered) {
         var height = (this._dimensions.height || 0) - parseInt(this._style.paddingTop, 10) - parseInt(this._style.paddingBottom, 10);
         this._offset = -(height - this._getCarouselItemSize()) / 2;
       }
     },

     _layoutCarouselItems: function _layoutCarouselItems() {
       var children = this._getCarouselItemElements();

       var sizeAttr = this._getCarouselItemSizeAttr();
       var sizeInfo = this._decomposeSizeString(sizeAttr);

       for (var i = 0; i < children.length; i++) {
         children[i].style.position = 'absolute';
         children[i].style.height = sizeAttr;
         children[i].style.visibility = 'visible';
         children[i].style.top = i * sizeInfo.number + sizeInfo.unit;
       }
     },

     _setup: function _setup() {
       this._updateDimensionData();
       this._updateOffset();
       this._layoutCarouselItems();
     }
   };

   var HorizontalModeTrait = {
     _getScrollDelta: function _getScrollDelta(event) {
       return event.gesture.deltaX;
     },

     _getScrollVelocity: function _getScrollVelocity(event) {
       return event.gesture.velocityX;
     },

     _getElementSize: function _getElementSize() {
       if (!this._currentElementSize) {
         this._currentElementSize = this.getBoundingClientRect().width;
       }

       return this._currentElementSize;
     },

     _generateScrollTransform: function _generateScrollTransform(scroll) {
       return 'translate3d(' + -scroll + 'px, 0px, 0px)';
     },

     _updateDimensionData: function _updateDimensionData() {
       this._style = window.getComputedStyle(this);
       this._dimensions = this.getBoundingClientRect();
     },

     _updateOffset: function _updateOffset() {
       if (this.centered) {
         var width = (this._dimensions.width || 0) - parseInt(this._style.paddingLeft, 10) - parseInt(this._style.paddingRight, 10);
         this._offset = -(width - this._getCarouselItemSize()) / 2;
       }
     },

     _layoutCarouselItems: function _layoutCarouselItems() {
       var children = this._getCarouselItemElements();

       var sizeAttr = this._getCarouselItemSizeAttr();
       var sizeInfo = this._decomposeSizeString(sizeAttr);

       for (var i = 0; i < children.length; i++) {
         children[i].style.position = 'absolute';
         children[i].style.width = sizeAttr;
         children[i].style.visibility = 'visible';
         children[i].style.left = i * sizeInfo.number + sizeInfo.unit;
       }
     },

     _setup: function _setup() {
       this._updateDimensionData();
       this._updateOffset();
       this._layoutCarouselItems();
     }
   };

   var CarouselElement = function (_BaseElement) {
     babelHelpers.inherits(CarouselElement, _BaseElement);

     function CarouselElement() {
       babelHelpers.classCallCheck(this, CarouselElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(CarouselElement).apply(this, arguments));
     }

     babelHelpers.createClass(CarouselElement, [{
       key: 'init',

       value: function init() {
         this._doorLock = new DoorLock();
         this._scroll = 0;
         this._offset = 0;
         this._lastActiveIndex = 0;

         this._boundOnDrag = this._onDrag.bind(this);
         this._boundOnDragEnd = this._onDragEnd.bind(this);
         this._boundOnResize = this._onResize.bind(this);

         this._mixin(this._isVertical() ? VerticalModeTrait : HorizontalModeTrait);
       }
     }, {
       key: '_onResize',
       value: function _onResize() {
         var i = this._scroll / this._currentElementSize;
         delete this._currentElementSize;
         this.setActiveIndex(i);
       }
     }, {
       key: '_onDirectionChange',
       value: function _onDirectionChange() {
         if (this._isVertical()) {
           this.style.overflowX = 'auto';
           this.style.overflowY = '';
         } else {
           this.style.overflowX = '';
           this.style.overflowY = 'auto';
         }

         this.refresh();
       }
     }, {
       key: '_saveLastState',
       value: function _saveLastState() {
         this._lastState = {
           elementSize: this._getCarouselItemSize(),
           carouselElementCount: this.itemCount,
           width: this._getCarouselItemSize() * this.itemCount
         };
       }
     }, {
       key: '_getCarouselItemSize',
       value: function _getCarouselItemSize() {
         var sizeAttr = this._getCarouselItemSizeAttr();
         var sizeInfo = this._decomposeSizeString(sizeAttr);
         var elementSize = this._getElementSize();

         if (sizeInfo.unit === '%') {
           return Math.round(sizeInfo.number / 100 * elementSize);
         } else if (sizeInfo.unit === 'px') {
           return sizeInfo.number;
         } else {
           throw new Error('Invalid state');
         }
       }
     }, {
       key: '_getInitialIndex',
       value: function _getInitialIndex() {
         var index = parseInt(this.getAttribute('initial-index'), 10);

         if (typeof index === 'number' && !isNaN(index)) {
           return Math.max(Math.min(index, this.itemCount - 1), 0);
         } else {
           return 0;
         }
       }
     }, {
       key: '_getCarouselItemSizeAttr',
       value: function _getCarouselItemSizeAttr() {
         var attrName = 'item-' + (this._isVertical() ? 'height' : 'width');
         var itemSizeAttr = ('' + this.getAttribute(attrName)).trim();

         return itemSizeAttr.match(/^\d+(px|%)$/) ? itemSizeAttr : '100%';
       }
     }, {
       key: '_decomposeSizeString',
       value: function _decomposeSizeString(size) {
         var matches = size.match(/^(\d+)(px|%)/);

         return {
           number: parseInt(matches[1], 10),
           unit: matches[2]
         };
       }
     }, {
       key: '_setupInitialIndex',
       value: function _setupInitialIndex() {
         this._scroll = (this._offset || 0) + this._getCarouselItemSize() * this._getInitialIndex();
         this._lastActiveIndex = this._getInitialIndex();
         this._scrollTo(this._scroll);
       }
     }, {
       key: 'setActiveIndex',
       value: function setActiveIndex(index) {
         var _this2 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         if (options && (typeof options === 'undefined' ? 'undefined' : babelHelpers.typeof(options)) != 'object') {
           throw new Error('options must be an object. You supplied ' + options);
         }

         options.animationOptions = util.extend({ duration: 0.3, timing: 'cubic-bezier(.1, .7, .1, 1)' }, 
          options.animationOptions || {}, 
          this.hasAttribute('animation-options') ? util.animationOptionsParse(this.getAttribute('animation-options')) : {});

         index = Math.max(0, Math.min(index, this.itemCount - 1));
         var scroll = (this._offset || 0) + this._getCarouselItemSize() * index;
         var max = this._calculateMaxScroll();

         this._scroll = Math.max(0, Math.min(max, scroll));
         return this._scrollTo(this._scroll, options).then(function () {
           _this2._tryFirePostChangeEvent();
           return _this2;
         });
       }
     }, {
       key: 'getActiveIndex',
       value: function getActiveIndex() {
         var scroll = this._scroll - (this._offset || 0);
         var count = this.itemCount;
         var size = this._getCarouselItemSize();

         if (scroll < 0) {
           return 0;
         }

         var i = void 0;
         for (i = 0; i < count; i++) {
           if (size * i <= scroll && size * (i + 1) > scroll) {
             return i;
           }
         }

         return i;
       }
     }, {
       key: 'next',
       value: function next(options) {
         return this.setActiveIndex(this.getActiveIndex() + 1, options);
       }
     }, {
       key: 'prev',
       value: function prev(options) {
         return this.setActiveIndex(this.getActiveIndex() - 1, options);
       }
     }, {
       key: '_isEnabledChangeEvent',
       value: function _isEnabledChangeEvent() {
         var elementSize = this._getElementSize();
         var carouselItemSize = this._getCarouselItemSize();

         return this.autoScroll && elementSize === carouselItemSize;
       }
     }, {
       key: '_isVertical',
       value: function _isVertical() {
         return this.getAttribute('direction') === 'vertical';
       }
     }, {
       key: '_prepareEventListeners',
       value: function _prepareEventListeners() {
         var _this3 = this;

         this._gestureDetector = new GestureDetector(this, {
           dragMinDistance: 1,
           dragLockToAxis: true
         });
         this._mutationObserver = new MutationObserver(function () {
           return _this3.refresh();
         });

         this._updateSwipeable();
         this._updateAutoRefresh();

         window.addEventListener('resize', this._boundOnResize, true);
       }
     }, {
       key: '_removeEventListeners',
       value: function _removeEventListeners() {
         this._gestureDetector.dispose();
         this._gestureDetector = null;

         this._mutationObserver.disconnect();
         this._mutationObserver = null;

         window.removeEventListener('resize', this._boundOnResize, true);
       }
     }, {
       key: '_updateSwipeable',
       value: function _updateSwipeable() {
         if (this._gestureDetector) {
           if (this.swipeable) {
             this._gestureDetector.on('drag dragleft dragright dragup dragdown swipe swipeleft swiperight swipeup swipedown', 
              this._boundOnDrag);
             this._gestureDetector.on('dragend', this._boundOnDragEnd);
           } else {
             this._gestureDetector.off('drag dragleft dragright dragup dragdown swipe swipeleft swiperight swipeup swipedown', 
              this._boundOnDrag);
             this._gestureDetector.off('dragend', this._boundOnDragEnd);
           }
         }
       }
     }, {
       key: '_updateAutoRefresh',
       value: function _updateAutoRefresh() {
         if (this._mutationObserver) {
           if (this.hasAttribute('auto-refresh')) {
             this._mutationObserver.observe(this, { childList: true });
           } else {
             this._mutationObserver.disconnect();
           }
         }
       }
     }, {
       key: '_tryFirePostChangeEvent',
       value: function _tryFirePostChangeEvent() {
         var currentIndex = this.getActiveIndex();

         if (this._lastActiveIndex !== currentIndex) {
           var lastActiveIndex = this._lastActiveIndex;
           this._lastActiveIndex = currentIndex;

           util.triggerElementEvent(this, 'postchange', {
             carousel: this,
             activeIndex: currentIndex,
             lastActiveIndex: lastActiveIndex
           });
         }
       }
     }, {
       key: '_isWrongDirection',
       value: function _isWrongDirection(d) {
         return this._isVertical() ? d === 'left' || d === 'right' : d === 'up' || d === 'down';
       }
     }, {
       key: '_onDrag',
       value: function _onDrag(event) {
         if (this._isWrongDirection(event.gesture.direction)) {
           return;
         }

         event.stopPropagation();

         this._lastDragEvent = event;

         var scroll = this._scroll - this._getScrollDelta(event);
         this._scrollTo(scroll);
         event.gesture.preventDefault();

         this._tryFirePostChangeEvent();
       }
     }, {
       key: '_onDragEnd',
       value: function _onDragEnd(event) {
         var _this4 = this;

         if (!this._lastDragEvent) {
           return;
         }
         this._currentElementSize = undefined;
         this._scroll = this._scroll - this._getScrollDelta(event);

         if (this._isOverScroll(this._scroll)) {
           var waitForAction = false;
           util.triggerElementEvent(this, 'overscroll', {
             carousel: this,
             activeIndex: this.getActiveIndex(),
             direction: this._getOverScrollDirection(),
             waitToReturn: function waitToReturn(promise) {
               waitForAction = true;
               promise.then(function () {
                 return _this4._scrollToKillOverScroll();
               });
             }
           });

           if (!waitForAction) {
             this._scrollToKillOverScroll();
           }
         } else {
           this._startMomentumScroll();
         }
         this._lastDragEvent = null;

         event.gesture.preventDefault();
       }
     }, {
       key: '_mixin',
       value: function _mixin(trait) {
         Object.keys(trait).forEach(function (key) {
           this[key] = trait[key];
         }.bind(this));
       }
     }, {
       key: '_startMomentumScroll',
       value: function _startMomentumScroll() {
         if (this._lastDragEvent) {
           var velocity = this._getScrollVelocity(this._lastDragEvent);
           var duration = 0.3;
           var scrollDelta = duration * 100 * velocity;
           var scroll = this._normalizeScrollPosition(this._scroll + 
            (this._getScrollDelta(this._lastDragEvent) > 0 ? -scrollDelta : scrollDelta));

           this._scroll = scroll;

           animit(this._getCarouselItemElements()).queue({
             transform: this._generateScrollTransform(this._scroll)
           }, {
             duration: duration,
             timing: 'cubic-bezier(.1, .7, .1, 1)'
           }).queue(function (done) {
             done();
             this._tryFirePostChangeEvent();
           }.bind(this)).play();
         }
       }
     }, {
       key: '_normalizeScrollPosition',
       value: function _normalizeScrollPosition(scroll) {
         var max = this._calculateMaxScroll();

         if (!this.autoScroll) {
           return Math.max(0, Math.min(max, scroll));
         }
         var arr = [];
         var size = this._getCarouselItemSize();
         var nbrOfItems = this.itemCount;

         for (var i = 0; i < nbrOfItems; i++) {
           if (i * size + this._offset < max) {
             arr.push(i * size + this._offset);
           }
         }
         arr.push(max);

         arr.sort(function (left, right) {
           left = Math.abs(left - scroll);
           right = Math.abs(right - scroll);

           return left - right;
         });

         arr = arr.filter(function (item, pos) {
           return !pos || item != arr[pos - 1];
         });

         var lastScroll = this._lastActiveIndex * size + this._offset;
         var scrollRatio = Math.abs(scroll - lastScroll) / size;
         var result = arr[0];

         if (scrollRatio <= this.autoScrollRatio) {
           result = lastScroll;
         } else if (scrollRatio < 1.0) {
           if (arr[0] === lastScroll && arr.length > 1) {
             result = arr[1];
           }
         }

         return Math.max(0, Math.min(max, result));
       }
     }, {
       key: '_getCarouselItemElements',
       value: function _getCarouselItemElements() {
         return util.arrayFrom(this.children).filter(function (child) {
           return child.nodeName.toLowerCase() === 'ons-carousel-item';
         });
       }
     }, {
       key: '_scrollTo',
       value: function _scrollTo(scroll) {
         var _this5 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         var isOverscrollable = this.overscrollable;

         var normalizeScroll = function normalizeScroll(scroll) {
           var ratio = 0.35;

           if (scroll < 0) {
             return isOverscrollable ? Math.round(scroll * ratio) : 0;
           }

           var maxScroll = _this5._calculateMaxScroll();
           if (maxScroll < scroll) {
             return isOverscrollable ? maxScroll + Math.round((scroll - maxScroll) * ratio) : maxScroll;
           }

           return scroll;
         };

         return new Promise(function (resolve) {
           animit(_this5._getCarouselItemElements()).queue({
             transform: _this5._generateScrollTransform(normalizeScroll(scroll))
           }, options.animation !== 'none' ? options.animationOptions : {}).play(function () {
             if (options.callback instanceof Function) {
               options.callback();
             }
             resolve();
           });
         });
       }
     }, {
       key: '_calculateMaxScroll',
       value: function _calculateMaxScroll() {
         var max = this.itemCount * this._getCarouselItemSize() - this._getElementSize();
         return Math.ceil(max < 0 ? 0 : max); // Need to return an integer value.
       }
     }, {
       key: '_isOverScroll',
       value: function _isOverScroll(scroll) {
         if (scroll < 0 || scroll > this._calculateMaxScroll()) {
           return true;
         }
         return false;
       }
     }, {
       key: '_getOverScrollDirection',
       value: function _getOverScrollDirection() {
         if (this._isVertical()) {
           return this._scroll <= 0 ? 'up' : 'down';
         } else {
           return this._scroll <= 0 ? 'left' : 'right';
         }
       }
     }, {
       key: '_scrollToKillOverScroll',
       value: function _scrollToKillOverScroll() {
         var duration = 0.4;

         if (this._scroll < 0) {
           animit(this._getCarouselItemElements()).queue({
             transform: this._generateScrollTransform(0)
           }, {
             duration: duration,
             timing: 'cubic-bezier(.1, .4, .1, 1)'
           }).queue(function (done) {
             done();
             this._tryFirePostChangeEvent();
           }.bind(this)).play();
           this._scroll = 0;
           return;
         }

         var maxScroll = this._calculateMaxScroll();

         if (maxScroll < this._scroll) {
           animit(this._getCarouselItemElements()).queue({
             transform: this._generateScrollTransform(maxScroll)
           }, {
             duration: duration,
             timing: 'cubic-bezier(.1, .4, .1, 1)'
           }).queue(function (done) {
             done();
             this._tryFirePostChangeEvent();
           }.bind(this)).play();
           this._scroll = maxScroll;
           return;
         }

         return;
       }
     }, {
       key: 'refresh',

       value: function refresh() {
         if (this._getCarouselItemSize() === 0) {
           return;
         }

         this._mixin(this._isVertical() ? VerticalModeTrait : HorizontalModeTrait);
         this._setup();

         if (this._lastState && this._lastState.width > 0) {
           var scroll = this._scroll; // - this._offset;

           if (this._isOverScroll(scroll)) {
             this._scrollToKillOverScroll();
           } else {
             if (this.autoScroll) {
               scroll = this._normalizeScrollPosition(scroll);
             }

             this._scrollTo(scroll);
           }
         }

         this._saveLastState();

         util.triggerElementEvent(this, 'refresh', { carousel: this });
       }
     }, {
       key: 'first',
       value: function first(options) {
         return this.setActiveIndex(0, options);
       }
     }, {
       key: 'last',
       value: function last(options) {
         this.setActiveIndex(Math.max(this.itemCount - 1, 0), options);
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var _this6 = this;

         this._prepareEventListeners();

         this._setup();
         this._setupInitialIndex();

         this._saveLastState();

         if (this.offsetHeight === 0) {
           setImmediate(function () {
             return _this6.refresh();
           });
         }
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         switch (name) {
           case 'swipeable':
             this._updateSwipeable();
             break;
           case 'auto-refresh':
             this._updateAutoRefresh();
             break;
           case 'direction':
             this._onDirectionChange();
         }
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this._removeEventListeners();
       }
     }, {
       key: 'itemCount',
       get: function get() {
         return this._getCarouselItemElements().length;
       }
     }, {
       key: 'autoScrollRatio',
       get: function get() {
         var attr = this.getAttribute('auto-scroll-ratio');

         if (!attr) {
           return 0.5;
         }

         var scrollRatio = parseFloat(attr);
         if (scrollRatio < 0.0 || scrollRatio > 1.0) {
           throw new Error('Invalid ratio.');
         }

         return isNaN(scrollRatio) ? 0.5 : scrollRatio;
       },
       set: function set(ratio) {
         if (ratio < 0.0 || ratio > 1.0) {
           throw new Error('Invalid ratio.');
         }

         this.setAttribute('auto-scroll-ratio', ratio);
       }
     }, {
       key: 'swipeable',
       get: function get() {
         return this.hasAttribute('swipeable');
       },
       set: function set(value) {
         return util.toggleAttribute(this, 'swipeable', value);
       }
     }, {
       key: 'autoScroll',
       get: function get() {
         return this.hasAttribute('auto-scroll');
       },
       set: function set(value) {
         return util.toggleAttribute(this, 'auto-scroll', value);
       }
     }, {
       key: 'disabled',
       get: function get() {
         return this.hasAttribute('disabled');
       },
       set: function set(value) {
         return util.toggleAttribute(this, 'disabled', value);
       }
     }, {
       key: 'overscrollable',
       get: function get() {
         return this.hasAttribute('overscrollable');
       },
       set: function set(value) {
         return util.toggleAttribute(this, 'overscrollable', value);
       }
     }, {
       key: 'centered',
       get: function get() {
         return this.hasAttribute('centered');
       },
       set: function set(value) {
         return util.toggleAttribute(this, 'centered', value);
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['swipeable', 'auto-refresh', 'direction'];
       }
     }]);
     return CarouselElement;
   }(BaseElement);

   customElements.define('ons-carousel', CarouselElement);

   var ColElement = function (_BaseElement) {
     babelHelpers.inherits(ColElement, _BaseElement);

     function ColElement() {
       babelHelpers.classCallCheck(this, ColElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ColElement).apply(this, arguments));
     }

     babelHelpers.createClass(ColElement, [{
       key: 'init',
       value: function init() {
         if (this.getAttribute('width')) {
           this._updateWidth();
         }
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'width') {
           this._updateWidth();
         }
       }
     }, {
       key: '_updateWidth',
       value: function _updateWidth() {
         var width = this.getAttribute('width');
         if (typeof width === 'string') {
           width = ('' + width).trim();
           width = width.match(/^\d+$/) ? width + '%' : width;

           this.style.webkitBoxFlex = '0';
           this.style.webkitFlex = '0 0 ' + width;
           this.style.mozBoxFlex = '0';
           this.style.mozFlex = '0 0 ' + width;
           this.style.msFlex = '0 0 ' + width;
           this.style.flex = '0 0 ' + width;
           this.style.maxWidth = width;
         }
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['width'];
       }
     }]);
     return ColElement;
   }(BaseElement);

   customElements.define('ons-col', ColElement);

   var DialogAnimator = function () {
     function DialogAnimator() {
       var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

       var _ref$timing = _ref.timing;
       var timing = _ref$timing === undefined ? 'linear' : _ref$timing;
       var _ref$delay = _ref.delay;
       var delay = _ref$delay === undefined ? 0 : _ref$delay;
       var _ref$duration = _ref.duration;
       var duration = _ref$duration === undefined ? 0.2 : _ref$duration;
       babelHelpers.classCallCheck(this, DialogAnimator);

       this.timing = timing;
       this.delay = delay;
       this.duration = duration;
     }

     babelHelpers.createClass(DialogAnimator, [{
       key: 'show',
       value: function show(dialog, done) {
         done();
       }
     }, {
       key: 'hide',
       value: function hide(dialog, done) {
         done();
       }
     }]);
     return DialogAnimator;
   }();

   var AndroidDialogAnimator = function (_DialogAnimator) {
     babelHelpers.inherits(AndroidDialogAnimator, _DialogAnimator);

     function AndroidDialogAnimator() {
       var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

       var _ref2$timing = _ref2.timing;
       var timing = _ref2$timing === undefined ? 'ease-in-out' : _ref2$timing;
       var _ref2$delay = _ref2.delay;
       var delay = _ref2$delay === undefined ? 0 : _ref2$delay;
       var _ref2$duration = _ref2.duration;
       var duration = _ref2$duration === undefined ? 0.3 : _ref2$duration;
       babelHelpers.classCallCheck(this, AndroidDialogAnimator);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(AndroidDialogAnimator).call(this, 
        { timing: timing, delay: delay, duration: duration }));
     }

     babelHelpers.createClass(AndroidDialogAnimator, [{
       key: 'show',
       value: function show(dialog, callback) {
         callback = callback ? callback : function () {};

         animit.runAll(animit(dialog._mask).queue({
           opacity: 0
         }).wait(this.delay).queue({
           opacity: 1.0
         }, {
           duration: this.duration,
           timing: this.timing
         }), animit(dialog._dialog).saveStyle().queue({
           css: {
             transform: 'translate3d(-50%, -60%, 0)',
             opacity: 0.0
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3d(-50%, -50%, 0)',
             opacity: 1.0
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }, {
       key: 'hide',
       value: function hide(dialog, callback) {
         callback = callback ? callback : function () {};

         animit.runAll(animit(dialog._mask).queue({
           opacity: 1.0
         }).wait(this.delay).queue({
           opacity: 0
         }, {
           duration: this.duration,
           timing: this.timing
         }), animit(dialog._dialog).saveStyle().queue({
           css: {
             transform: 'translate3d(-50%, -50%, 0)',
             opacity: 1.0
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3d(-50%, -60%, 0)',
             opacity: 0.0
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }]);
     return AndroidDialogAnimator;
   }(DialogAnimator);

   var IOSDialogAnimator = function (_DialogAnimator2) {
     babelHelpers.inherits(IOSDialogAnimator, _DialogAnimator2);

     function IOSDialogAnimator() {
       var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

       var _ref3$timing = _ref3.timing;
       var timing = _ref3$timing === undefined ? 'ease-in-out' : _ref3$timing;
       var _ref3$delay = _ref3.delay;
       var delay = _ref3$delay === undefined ? 0 : _ref3$delay;
       var _ref3$duration = _ref3.duration;
       var duration = _ref3$duration === undefined ? 0.3 : _ref3$duration;
       babelHelpers.classCallCheck(this, IOSDialogAnimator);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(IOSDialogAnimator).call(this, 
        { timing: timing, delay: delay, duration: duration }));
     }

     babelHelpers.createClass(IOSDialogAnimator, [{
       key: 'show',
       value: function show(dialog, callback) {
         callback = callback ? callback : function () {};

         animit.runAll(animit(dialog._mask).queue({
           opacity: 0
         }).wait(this.delay).queue({
           opacity: 1.0
         }, {
           duration: this.duration,
           timing: this.timing
         }), animit(dialog._dialog).saveStyle().queue({
           css: {
             transform: 'translate3d(-50%, 300%, 0)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3d(-50%, -50%, 0)'
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }, {
       key: 'hide',
       value: function hide(dialog, callback) {
         callback = callback ? callback : function () {};

         animit.runAll(animit(dialog._mask).queue({
           opacity: 1.0
         }).wait(this.delay).queue({
           opacity: 0
         }, {
           duration: this.duration,
           timing: this.timing
         }), animit(dialog._dialog).saveStyle().queue({
           css: {
             transform: 'translate3d(-50%, -50%, 0)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3d(-50%, 300%, 0)'
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }]);
     return IOSDialogAnimator;
   }(DialogAnimator);

   var SlideDialogAnimator = function (_DialogAnimator3) {
     babelHelpers.inherits(SlideDialogAnimator, _DialogAnimator3);

     function SlideDialogAnimator() {
       var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

       var _ref4$timing = _ref4.timing;
       var timing = _ref4$timing === undefined ? 'cubic-bezier(.1, .7, .4, 1)' : _ref4$timing;
       var _ref4$delay = _ref4.delay;
       var delay = _ref4$delay === undefined ? 0 : _ref4$delay;
       var _ref4$duration = _ref4.duration;
       var duration = _ref4$duration === undefined ? 0.2 : _ref4$duration;
       babelHelpers.classCallCheck(this, SlideDialogAnimator);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SlideDialogAnimator).call(this, 
        { timing: timing, delay: delay, duration: duration }));
     }

     babelHelpers.createClass(SlideDialogAnimator, [{
       key: 'show',
       value: function show(dialog, callback) {
         callback = callback ? callback : function () {};

         animit.runAll(animit(dialog._mask).queue({
           opacity: 0
         }).wait(this.delay).queue({
           opacity: 1.0
         }, {
           duration: this.duration,
           timing: this.timing
         }), animit(dialog._dialog).saveStyle().queue({
           css: {
             transform: 'translate3D(-50%, -350%, 0)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(-50%, -50%, 0)'
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }, {
       key: 'hide',
       value: function hide(dialog, callback) {
         callback = callback ? callback : function () {};

         animit.runAll(animit(dialog._mask).queue({
           opacity: 1.0
         }).wait(this.delay).queue({
           opacity: 0
         }, {
           duration: this.duration,
           timing: this.timing
         }), animit(dialog._dialog).saveStyle().queue({
           css: {
             transform: 'translate3D(-50%, -50%, 0)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(-50%, -350%, 0)'
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }]);
     return SlideDialogAnimator;
   }(DialogAnimator);

   var scheme$5 = {
     '.dialog': 'dialog--*',
     '.dialog-container': 'dialog-container--*',
     '.dialog-mask': 'dialog-mask--*'
   };

   var _animatorDict$1 = {
     'default': function _default() {
       return platform.isAndroid() ? AndroidDialogAnimator : IOSDialogAnimator;
     },
     'slide': SlideDialogAnimator,
     'none': DialogAnimator
   };

   var DialogElement = function (_BaseElement) {
     babelHelpers.inherits(DialogElement, _BaseElement);

     function DialogElement() {
       babelHelpers.classCallCheck(this, DialogElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(DialogElement).apply(this, arguments));
     }

     babelHelpers.createClass(DialogElement, [{
       key: 'init',
       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           return _this2._compile();
         });

         this._visible = false;
         this._doorLock = new DoorLock();
         this._boundCancel = this._cancel.bind(this);

         this._updateAnimatorFactory();
       }
     }, {
       key: '_updateAnimatorFactory',
       value: function _updateAnimatorFactory() {
         this._animatorFactory = new AnimatorFactory({
           animators: _animatorDict$1,
           baseClass: DialogAnimator,
           baseClassName: 'DialogAnimator',
           defaultAnimation: this.getAttribute('animation')
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         this.style.display = 'none';

         if (!this._dialog) {
           var dialog = document.createElement('div');
           dialog.classList.add('dialog');

           var container = document.createElement('div');
           dialog.classList.add('dialog-container');

           dialog.appendChild(container);

           while (this.firstChild) {
             container.appendChild(this.firstChild);
           }

           this.appendChild(dialog);
         }

         if (!this._mask) {
           var mask = document.createElement('div');
           mask.classList.add('dialog-mask');
           this.insertBefore(mask, this.firstChild);
         }

         this._dialog.style.zIndex = 20001;
         this._mask.style.zIndex = 20000;

         this.setAttribute('status-bar-fill', '');

         ModifierUtil.initModifier(this, scheme$5);
       }
     }, {
       key: '_cancel',
       value: function _cancel() {
         var _this3 = this;

         if (this.cancelable && !this._running) {
           this._running = true;
           this.hide({
             callback: function callback() {
               _this3._running = false;
               util.triggerElementEvent(_this3, 'dialog-cancel');
             }
           });
         }
       }
     }, {
       key: 'show',
       value: function show() {
         var _this4 = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         var _cancel2 = false;
         var callback = options.callback || function () {};

         options.animationOptions = util.extend(options.animationOptions || {}, 
          AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

         util.triggerElementEvent(this, 'preshow', {
           dialog: this,
           cancel: function cancel() {
             _cancel2 = true;
           }
         });

         if (!_cancel2) {
           var _ret = function () {
             var tryShow = function tryShow() {
               var unlock = _this4._doorLock.lock();
               var animator = _this4._animatorFactory.newAnimator(options);

               _this4.style.display = 'block';
               _this4._mask.style.opacity = '1';

               return new Promise(function (resolve) {
                 contentReady(_this4, function () {
                   animator.show(_this4, function () {
                     _this4._visible = true;
                     unlock();

                     util.triggerElementEvent(_this4, 'postshow', { dialog: _this4 });

                     callback();
                     resolve(_this4);
                   });
                 });
               });
             };

             return {
               v: new Promise(function (resolve) {
                 _this4._doorLock.waitUnlock(function () {
                   return resolve(tryShow());
                 });
               })
             };
           }();

           if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
         } else {
           return Promise.reject('Canceled in preshow event.');
         }
       }
     }, {
       key: 'hide',
       value: function hide() {
         var _this5 = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         var _cancel3 = false;
         var callback = options.callback || function () {};

         options.animationOptions = util.extend(options.animationOptions || {}, 
          AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

         util.triggerElementEvent(this, 'prehide', {
           dialog: this,
           cancel: function cancel() {
             _cancel3 = true;
           }
         });

         if (!_cancel3) {
           var _ret2 = function () {
             var tryHide = function tryHide() {
               var unlock = _this5._doorLock.lock();
               var animator = _this5._animatorFactory.newAnimator(options);

               return new Promise(function (resolve) {
                 contentReady(_this5, function () {
                   animator.hide(_this5, function () {
                     _this5.style.display = 'none';
                     _this5._visible = false;
                     unlock();

                     util.triggerElementEvent(_this5, 'posthide', { dialog: _this5 });

                     callback();
                     resolve(_this5);
                   });
                 });
               });
             };

             return {
               v: new Promise(function (resolve) {
                 _this5._doorLock.waitUnlock(function () {
                   return resolve(tryHide());
                 });
               })
             };
           }();

           if ((typeof _ret2 === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret2)) === "object") return _ret2.v;
         } else {
           return Promise.reject('Canceled in prehide event.');
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var _this6 = this;

         this.onDeviceBackButton = function (e) {
           return _this6.cancelable ? _this6._cancel() : e.callParentHandler();
         };

         contentReady(this, function () {
           _this6._mask.addEventListener('click', _this6._boundCancel, false);
         });
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this._backButtonHandler.destroy();
         this._backButtonHandler = null;

         this._mask.removeEventListener('click', this._boundCancel.bind(this), false);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$5);
         } else if (name === 'animation') {
           this._updateAnimatorFactory();
         }
       }
     }, {
       key: '_mask',

       get: function get() {
         return util.findChild(this, '.dialog-mask');
       }
     }, {
       key: '_dialog',
       get: function get() {
         return util.findChild(this, '.dialog');
       }
     }, {
       key: 'onDeviceBackButton',
       get: function get() {
         return this._backButtonHandler;
       },
       set: function set(callback) {
         if (this._backButtonHandler) {
           this._backButtonHandler.destroy();
         }

         this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
       }
     }, {
       key: 'visible',
       get: function get() {
         return this._visible;
       }
     }, {
       key: 'disabled',
       set: function set(value) {
         return util.toggleAttribute(this, 'disabled', value);
       },
       get: function get() {
         return this.hasAttribute('disabled');
       }
     }, {
       key: 'cancelable',
       set: function set(value) {
         return util.toggleAttribute(this, 'cancelable', value);
       },
       get: function get() {
         return this.hasAttribute('cancelable');
       }
     }], [{
       key: 'registerAnimator',
       value: function registerAnimator(name, Animator) {
         if (!(Animator.prototype instanceof DialogAnimator)) {
           throw new Error('"Animator" param must inherit OnsDialogElement.DialogAnimator');
         }
         _animatorDict$1[name] = Animator;
       }
     }, {
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'animation'];
       }
     }, {
       key: 'DialogAnimator',
       get: function get() {
         return DialogAnimator;
       }
     }]);
     return DialogElement;
   }(BaseElement);

   customElements.define('ons-dialog', DialogElement);

   var scheme$6 = {
     '': 'fab--*'
   };

   var FabElement = function (_BaseElement) {
     babelHelpers.inherits(FabElement, _BaseElement);

     function FabElement() {
       babelHelpers.classCallCheck(this, FabElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(FabElement).apply(this, arguments));
     }

     babelHelpers.createClass(FabElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           _this2._compile();
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         var _this3 = this;

         autoStyle.prepare(this);

         this.classList.add('fab');

         if (!util.findChild(this, '.fab__icon')) {
           (function () {
             var content = document.createElement('span');
             content.classList.add('fab__icon');

             util.arrayFrom(_this3.childNodes).forEach(function (element) {
               if (!element.tagName || element.tagName.toLowerCase() !== 'ons-ripple') {
                 content.appendChild(element);
               }
             });
             _this3.appendChild(content);
           })();
         }

         this._updateRipple();

         ModifierUtil.initModifier(this, scheme$6);

         this._updatePosition();

         this.show();
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         switch (name) {
           case 'modifier':
             ModifierUtil.onModifierChanged(last, current, this, scheme$6);
             break;
           case 'ripple':
             this._updateRipple();
             break;
           case 'position':
             this._updatePosition();
         }
       }
     }, {
       key: '_show',
       value: function _show() {
         this.show();
       }
     }, {
       key: '_hide',
       value: function _hide() {
         this.hide();
       }
     }, {
       key: '_updateRipple',
       value: function _updateRipple() {
         util.updateRipple(this);
       }
     }, {
       key: '_updatePosition',
       value: function _updatePosition() {
         var position = this.getAttribute('position');
         this.classList.remove('fab--top__left', 'fab--bottom__right', 'fab--bottom__left', 'fab--top__right', 
          'fab--top__center', 'fab--bottom__center');
         switch (position) {
           case 'top right':
           case 'right top':
             this.classList.add('fab--top__right');
             break;
           case 'top left':
           case 'left top':
             this.classList.add('fab--top__left');
             break;
           case 'bottom right':
           case 'right bottom':
             this.classList.add('fab--bottom__right');
             break;
           case 'bottom left':
           case 'left bottom':
             this.classList.add('fab--bottom__left');
             break;
           case 'center top':
           case 'top center':
             this.classList.add('fab--top__center');
             break;
           case 'center bottom':
           case 'bottom center':
             this.classList.add('fab--bottom__center');
             break;
           default:
             break;
         }
       }
     }, {
       key: 'show',
       value: function show() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         this.style.transform = 'scale(1)';
         this.style.webkitTransform = 'scale(1)';
       }
     }, {
       key: 'hide',
       value: function hide() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         this.style.transform = 'scale(0)';
         this.style.webkitTransform = 'scale(0)';
       }
     }, {
       key: 'toggle',

       value: function toggle() {
         this.visible ? this.hide() : this.show();
       }
     }, {
       key: 'disabled',
       set: function set(value) {
         return util.toggleAttribute(this, 'disabled', value);
       },
       get: function get() {
         return this.hasAttribute('disabled');
       }
     }, {
       key: 'visible',
       get: function get() {
         return this.style.transform === 'scale(1)' && this.style.display !== 'none';
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'ripple', 'position'];
       }
     }]);
     return FabElement;
   }(BaseElement);

   customElements.define('ons-fab', FabElement);

   var GestureDetectorElement = function (_BaseElement) {
     babelHelpers.inherits(GestureDetectorElement, _BaseElement);

     function GestureDetectorElement() {
       babelHelpers.classCallCheck(this, GestureDetectorElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(GestureDetectorElement).apply(this, arguments));
     }

     babelHelpers.createClass(GestureDetectorElement, [{
       key: 'init',
       value: function init() {
         this._gestureDetector = new GestureDetector(this);
       }
     }]);
     return GestureDetectorElement;
   }(BaseElement);

   customElements.define('ons-gesture-detector', GestureDetectorElement);

   var IconElement = function (_BaseElement) {
     babelHelpers.inherits(IconElement, _BaseElement);

     function IconElement() {
       babelHelpers.classCallCheck(this, IconElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(IconElement).apply(this, arguments));
     }

     babelHelpers.createClass(IconElement, [{
       key: 'init',

       value: function init() {
         this._compile();
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (['icon', 'size', 'modifier'].indexOf(name) !== -1) {
           this._update();
         }
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);
         this._update();
       }
     }, {
       key: '_update',
       value: function _update() {
         var _this2 = this;

         this._cleanClassAttribute();

         var _buildClassAndStyle2 = this._buildClassAndStyle(this._getAttribute('icon'), this._getAttribute('size'));

         var classList = _buildClassAndStyle2.classList;
         var style = _buildClassAndStyle2.style;

         util.extend(this.style, style);

         classList.forEach(function (className) {
           return _this2.classList.add(className);
         });
       }
     }, {
       key: '_getAttribute',
       value: function _getAttribute(attr) {
         var parts = (this.getAttribute(attr) || '').split(/\s*,\s*/);
         var def = parts[0];
         var md = parts[1];
         md = (md || '').split(/\s*:\s*/);
         return (util.hasModifier(this, md[0]) ? md[1] : def) || '';
       }
     }, {
       key: '_cleanClassAttribute',
       value: function _cleanClassAttribute() {
         var _this3 = this;

         util.arrayFrom(this.classList).filter(function (className) {
           return (/^(fa$|fa-|ion-|zmdi-)/.test(className));
         }).forEach(function (className) {
           return _this3.classList.remove(className);
         });

         this.classList.remove('zmdi');
         this.classList.remove('ons-icon--ion');
       }
     }, {
       key: '_buildClassAndStyle',
       value: function _buildClassAndStyle(iconName, size) {
         var classList = ['ons-icon'];
         var style = {};

         if (iconName.indexOf('ion-') === 0) {
           classList.push(iconName);
           classList.push('ons-icon--ion');
         } else if (iconName.indexOf('fa-') === 0) {
           classList.push(iconName);
           classList.push('fa');
         } else if (iconName.indexOf('md-') === 0) {
           classList.push('zmdi');
           classList.push('zmdi-' + iconName.split(/\-(.+)?/)[1]);
         } else {
           classList.push('fa');
           classList.push('fa-' + iconName);
         }

         if (size.match(/^[1-5]x|lg$/)) {
           classList.push('fa-' + size);
           this.style.removeProperty('font-size');
         } else {
           style.fontSize = size;
         }

         return {
           classList: classList,
           style: style
         };
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['icon', 'size', 'modifier'];
       }
     }]);
     return IconElement;
   }(BaseElement);

   customElements.define('ons-icon', IconElement);

   var LazyRepeatElement = function (_BaseElement) {
     babelHelpers.inherits(LazyRepeatElement, _BaseElement);

     function LazyRepeatElement() {
       babelHelpers.classCallCheck(this, LazyRepeatElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(LazyRepeatElement).apply(this, arguments));
     }

     babelHelpers.createClass(LazyRepeatElement, [{
       key: 'connectedCallback',
       value: function connectedCallback() {
         util.updateParentPosition(this);

         if (this.hasAttribute('delegate')) {
           this.delegate = window[this.getAttribute('delegate')];
         }
       }
     }, {
       key: 'refresh',

       value: function refresh() {
         this._lazyRepeatProvider && this._lazyRepeatProvider.refresh();
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {}
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         if (this._lazyRepeatProvider) {
           this._lazyRepeatProvider.destroy();
           this._lazyRepeatProvider = null;
         }
       }
     }, {
       key: 'delegate',
       set: function set(userDelegate) {
         this._lazyRepeatProvider && this._lazyRepeatProvider.destroy();

         if (!this._templateElement && this.children[0]) {
           this._templateElement = this.removeChild(this.children[0]);
         }

         var delegate = new LazyRepeatDelegate(userDelegate, this._templateElement || null);
         this._lazyRepeatProvider = new LazyRepeatProvider(this.parentElement, delegate);
       },
       get: function get() {
         throw new Error('This property can only be used to set the delegate object.');
       }
     }]);
     return LazyRepeatElement;
   }(BaseElement);

   customElements.define('ons-lazy-repeat', LazyRepeatElement);

   var scheme$7 = { '': 'list__header--*' };

   var ListHeaderElement = function (_BaseElement) {
     babelHelpers.inherits(ListHeaderElement, _BaseElement);

     function ListHeaderElement() {
       babelHelpers.classCallCheck(this, ListHeaderElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ListHeaderElement).apply(this, arguments));
     }

     babelHelpers.createClass(ListHeaderElement, [{
       key: 'init',

       value: function init() {
         this._compile();
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);
         this.classList.add('list__header');
         ModifierUtil.initModifier(this, scheme$7);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$7);
         }
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier'];
       }
     }]);
     return ListHeaderElement;
   }(BaseElement);

   customElements.define('ons-list-header', ListHeaderElement);

   var scheme$8 = {
     '.list__item': 'list__item--*',
     '.list__item__left': 'list__item--*__left',
     '.list__item__center': 'list__item--*__center',
     '.list__item__right': 'list__item--*__right',
     '.list__item__label': 'list__item--*__label',
     '.list__item__title': 'list__item--*__title',
     '.list__item__subtitle': 'list__item--*__subtitle',
     '.list__item__thumbnail': 'list__item--*__thumbnail',
     '.list__item__icon': 'list__item--*__icon'
   };

   var ListItemElement = function (_BaseElement) {
     babelHelpers.inherits(ListItemElement, _BaseElement);

     function ListItemElement() {
       babelHelpers.classCallCheck(this, ListItemElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ListItemElement).apply(this, arguments));
     }

     babelHelpers.createClass(ListItemElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           _this2._compile();
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         this.classList.add('list__item');

         var left = void 0,
             center = void 0,
             right = void 0;

         for (var i = 0; i < this.children.length; i++) {
           var el = this.children[i];

           if (el.classList.contains('left')) {
             el.classList.add('list__item__left');
             left = el;
           } else if (el.classList.contains('center')) {
             center = el;
           } else if (el.classList.contains('right')) {
             el.classList.add('list__item__right');
             right = el;
           }
         }

         if (!center) {
           center = document.createElement('div');

           if (!left && !right) {
             while (this.childNodes[0]) {
               center.appendChild(this.childNodes[0]);
             }
           } else {
             for (var _i = this.childNodes.length - 1; _i >= 0; _i--) {
               var _el = this.childNodes[_i];
               if (_el !== left && _el !== right) {
                 center.insertBefore(_el, center.firstChild);
               }
             }
           }

           this.insertBefore(center, right || null);
         }

         center.classList.add('center');
         center.classList.add('list__item__center');

         this._updateRipple();

         ModifierUtil.initModifier(this, scheme$8);

         autoStyle.prepare(this);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         switch (name) {
           case 'modifier':
             ModifierUtil.onModifierChanged(last, current, this, scheme$8);
             break;
           case 'ripple':
             this._updateRipple();
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this.addEventListener('drag', this._onDrag);
         this.addEventListener('touchstart', this._onTouch);
         this.addEventListener('mousedown', this._onTouch);
         this.addEventListener('touchend', this._onRelease);
         this.addEventListener('touchmove', this._onRelease);
         this.addEventListener('touchcancel', this._onRelease);
         this.addEventListener('mouseup', this._onRelease);
         this.addEventListener('mouseout', this._onRelease);
         this.addEventListener('touchleave', this._onRelease);

         this._originalBackgroundColor = this.style.backgroundColor;

         this.tapped = false;
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this.removeEventListener('drag', this._onDrag);
         this.removeEventListener('touchstart', this._onTouch);
         this.removeEventListener('mousedown', this._onTouch);
         this.removeEventListener('touchend', this._onRelease);
         this.removeEventListener('touchmove', this._onRelease);
         this.removeEventListener('touchcancel', this._onRelease);
         this.removeEventListener('mouseup', this._onRelease);
         this.removeEventListener('mouseout', this._onRelease);
         this.removeEventListener('touchleave', this._onRelease);
       }
     }, {
       key: '_updateRipple',
       value: function _updateRipple() {
         util.updateRipple(this);
       }
     }, {
       key: '_onDrag',
       value: function _onDrag(event) {
         var gesture = event.gesture;
         if (this._shouldLockOnDrag() && ['left', 'right'].indexOf(gesture.direction) > -1) {
           gesture.preventDefault();
         }
       }
     }, {
       key: '_onTouch',
       value: function _onTouch() {
         if (this.tapped) {
           return;
         }

         this.tapped = true;

         this.style.transition = this._transition;
         this.style.webkitTransition = this._transition;
         this.style.MozTransition = this._transition;

         if (this._tappable) {
           if (this.style.backgroundColor) {
             this._originalBackgroundColor = this.style.backgroundColor;
           }

           this.style.backgroundColor = this._tapBackgroundColor;
           this.style.boxShadow = '0px -1px 0px 0px ' + this._tapBackgroundColor;
         }
       }
     }, {
       key: '_onRelease',
       value: function _onRelease() {
         this.tapped = false;

         this.style.transition = '';
         this.style.webkitTransition = '';
         this.style.MozTransition = '';

         this.style.backgroundColor = this._originalBackgroundColor || '';
         this.style.boxShadow = '';
       }
     }, {
       key: '_shouldLockOnDrag',
       value: function _shouldLockOnDrag() {
         return this.hasAttribute('lock-on-drag');
       }
     }, {
       key: '_transition',
       get: function get() {
         return 'background-color 0.0s linear 0.02s, box-shadow 0.0s linear 0.02s';
       }
     }, {
       key: '_tappable',
       get: function get() {
         return this.hasAttribute('tappable');
       }
     }, {
       key: '_tapBackgroundColor',
       get: function get() {
         return this.getAttribute('tap-background-color') || '#d9d9d9';
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'ripple'];
       }
     }]);
     return ListItemElement;
   }(BaseElement);

   customElements.define('ons-list-item', ListItemElement);

   var scheme$9 = { '': 'list--*' };

   var ListElement = function (_BaseElement) {
     babelHelpers.inherits(ListElement, _BaseElement);

     function ListElement() {
       babelHelpers.classCallCheck(this, ListElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ListElement).apply(this, arguments));
     }

     babelHelpers.createClass(ListElement, [{
       key: 'init',

       value: function init() {
         this._compile();
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);
         this.classList.add('list');
         ModifierUtil.initModifier(this, scheme$9);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$9);
         }
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier'];
       }
     }]);
     return ListElement;
   }(BaseElement);

   customElements.define('ons-list', ListElement);

   var scheme$10 = {
     '.text-input': 'text-input--*',
     '.text-input__label': 'text-input--*__label',
     '.radio-button': 'radio-button--*',
     '.radio-button__input': 'radio-button--*__input',
     '.radio-button__checkmark': 'radio-button--*__checkmark',
     '.checkbox': 'checkbox--*',
     '.checkbox__input': 'checkbox--*__input',
     '.checkbox__checkmark': 'checkbox--*__checkmark'
   };

   var INPUT_ATTRIBUTES = ['autocapitalize', 'autocomplete', 'autocorrect', 'autofocus', 'disabled', 'inputmode', 
    'max', 'maxlength', 'min', 'minlength', 'name', 'pattern', 'placeholder', 'readonly', 'size', 'step', 'type', 
    'validator', 'value'];

   var InputElement = function (_BaseElement) {
     babelHelpers.inherits(InputElement, _BaseElement);

     function InputElement() {
       babelHelpers.classCallCheck(this, InputElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(InputElement).apply(this, arguments));
     }

     babelHelpers.createClass(InputElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           _this2._compile();
           _this2.attributeChangedCallback('checked', null, _this2.getAttribute('checked'));
         });

         this._boundOnInput = this._onInput.bind(this);
         this._boundOnFocusin = this._onFocusin.bind(this);
         this._boundDelegateEvent = this._delegateEvent.bind(this);
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         if (this.children.length !== 0) {
           return;
         }

         var helper = document.createElement('span');
         helper.classList.add('_helper');

         var container = document.createElement('label');
         container.appendChild(document.createElement('input'));
         container.appendChild(helper);

         var label = document.createElement('span');
         label.classList.add('input-label');

         util.arrayFrom(this.childNodes).forEach(function (element) {
           return label.appendChild(element);
         });
         this.hasAttribute('content-left') ? container.insertBefore(label, container.firstChild) : container.appendChild(label);

         this.appendChild(container);

         switch (this.getAttribute('type')) {
           case 'checkbox':
             this.classList.add('checkbox');
             this._input.classList.add('checkbox__input');
             this._helper.classList.add('checkbox__checkmark');
             this._updateBoundAttributes();
             break;

           case 'radio':
             this.classList.add('radio-button');
             this._input.classList.add('radio-button__input');
             this._helper.classList.add('radio-button__checkmark');
             this._updateBoundAttributes();
             break;

           default:
             this._input.classList.add('text-input');
             this._helper.classList.add('text-input__label');
             this._input.parentElement.classList.add('text-input__container');

             this._updateLabel();
             this._updateBoundAttributes();
             this._updateLabelClass();
             break;
         }

         if (this.hasAttribute('input-id')) {
           this._input.id = this.getAttribute('input-id');
         }

         ModifierUtil.initModifier(this, scheme$10);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         var _this3 = this;

         if (name === 'modifier') {
           return contentReady(this, function () {
             return ModifierUtil.onModifierChanged(last, current, _this3, scheme$10);
           });
         } else if (name === 'placeholder') {
           return contentReady(this, function () {
             return _this3._updateLabel();
           });
         }if (name === 'input-id') {
           contentReady(this, function () {
             return _this3._input.id = current;
           });
         }if (name === 'checked') {
           this.checked = current !== null;
         } else if (INPUT_ATTRIBUTES.indexOf(name) >= 0) {
           return contentReady(this, function () {
             return _this3._updateBoundAttributes();
           });
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var _this4 = this;

         contentReady(this, function () {
           if (_this4._input.type !== 'checkbox' && _this4._input.type !== 'radio') {
             _this4._input.addEventListener('input', _this4._boundOnInput);
             _this4._input.addEventListener('focusin', _this4._boundOnFocusin);
             _this4._input.addEventListener('focusout', _this4._boundOnFocusout);
           }

           _this4._input.addEventListener('focus', _this4._boundDelegateEvent);
           _this4._input.addEventListener('blur', _this4._boundDelegateEvent);
         });
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         var _this5 = this;

         contentReady(this, function () {
           _this5._input.removeEventListener('input', _this5._boundOnInput);
           _this5._input.removeEventListener('focusin', _this5._boundOnFocusin);
           _this5._input.removeEventListener('focus', _this5._boundDelegateEvent);
           _this5._input.removeEventListener('blur', _this5._boundDelegateEvent);
         });
       }
     }, {
       key: '_setLabel',
       value: function _setLabel(value) {
         if (typeof this._helper.textContent !== 'undefined') {
           this._helper.textContent = value;
         } else {
           this._helper.innerText = value;
         }
       }
     }, {
       key: '_updateLabel',
       value: function _updateLabel() {
         this._setLabel(this.hasAttribute('placeholder') ? this.getAttribute('placeholder') : '');
       }
     }, {
       key: '_updateBoundAttributes',
       value: function _updateBoundAttributes() {
         var _this6 = this;

         INPUT_ATTRIBUTES.forEach(function (attr) {
           if (_this6.hasAttribute(attr)) {
             _this6._input.setAttribute(attr, _this6.getAttribute(attr));
           } else {
             _this6._input.removeAttribute(attr);
           }
         });
       }
     }, {
       key: '_updateLabelClass',
       value: function _updateLabelClass() {
         if (this.value === '') {
           this._helper.classList.remove('text-input--material__label--active');
         } else if (['checkbox', 'radio'].indexOf(this.getAttribute('type')) === -1) {
           this._helper.classList.add('text-input--material__label--active');
         }
       }
     }, {
       key: '_delegateEvent',
       value: function _delegateEvent(event) {
         var e = new CustomEvent(event.type, {
           bubbles: false,
           cancelable: true
         });

         return this.dispatchEvent(e);
       }
     }, {
       key: '_onInput',
       value: function _onInput(event) {
         this._updateLabelClass();
       }
     }, {
       key: '_onFocusin',
       value: function _onFocusin(event) {
         this._updateLabelClass();
       }
     }, {
       key: '_input',
       get: function get() {
         return this.querySelector('input');
       }
     }, {
       key: '_helper',
       get: function get() {
         return this.querySelector('._helper');
       }
     }, {
       key: 'value',
       get: function get() {
         return this._input === null ? this.getAttribute('value') : this._input.value;
       },
       set: function set(val) {
         var _this7 = this;

         this.setAttribute('value', val);

         contentReady(this, function () {
           _this7._input.value = val;
           _this7._onInput();
         });

         return val;
       }
     }, {
       key: 'checked',
       get: function get() {
         return this._input.checked;
       },
       set: function set(val) {
         var _this8 = this;

         contentReady(this, function () {
           _this8._input.checked = val;
         });
       }
     }, {
       key: 'disabled',
       set: function set(value) {
         return util.toggleAttribute(this, 'disabled', value);
       },
       get: function get() {
         return this.hasAttribute('disabled');
       }
     }, {
       key: '_isTextInput',
       get: function get() {
         return this.type !== 'radio' && this.type !== 'checkbox';
       }
     }, {
       key: 'type',
       get: function get() {
         return this.getAttribute('type');
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'placeholder', 'input-id', 'checked'].concat(INPUT_ATTRIBUTES);
       }
     }]);
     return InputElement;
   }(BaseElement);

   customElements.define('ons-input', InputElement);

   var ModalAnimator = function () {
     function ModalAnimator() {
       var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
       babelHelpers.classCallCheck(this, ModalAnimator);

       this.delay = 0;
       this.duration = 0.2;

       this.timing = options.timing || this.timing;
       this.duration = options.duration !== undefined ? options.duration : this.duration;
       this.delay = options.delay !== undefined ? options.delay : this.delay;
     }

     babelHelpers.createClass(ModalAnimator, [{
       key: "show",
       value: function show(modal, callback) {
         callback();
       }
     }, {
       key: "hide",
       value: function hide(modal, callback) {
         callback();
       }
     }]);
     return ModalAnimator;
   }();

   var FadeModalAnimator = function (_ModalAnimator) {
     babelHelpers.inherits(FadeModalAnimator, _ModalAnimator);

     function FadeModalAnimator(options) {
       babelHelpers.classCallCheck(this, FadeModalAnimator);

       options.timing = options.timing || 'linear';
       options.duration = options.duration || '0.3';
       options.delay = options.delay || 0;

       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(FadeModalAnimator).call(this, options));
     }

     babelHelpers.createClass(FadeModalAnimator, [{
       key: 'show',
       value: function show(modal, callback) {
         callback = callback ? callback : function () {};

         animit(modal).queue({
           opacity: 0
         }).wait(this.delay).queue({
           opacity: 1.0
         }, {
           duration: this.duration,
           timing: this.timing
         }).queue(function (done) {
           callback();
           done();
         }).play();
       }
     }, {
       key: 'hide',
       value: function hide(modal, callback) {
         callback = callback ? callback : function () {};

         animit(modal).queue({
           opacity: 1
         }).wait(this.delay).queue({
           opacity: 0
         }, {
           duration: this.duration,
           timing: this.timing
         }).queue(function (done) {
           callback();
           done();
         }).play();
       }
     }]);
     return FadeModalAnimator;
   }(ModalAnimator);

   var scheme$11 = {
     '': 'modal--*',
     'modal__content': 'modal--*__content'
   };

   var _animatorDict$2 = {
     'default': ModalAnimator,
     'fade': FadeModalAnimator,
     'none': ModalAnimator
   };

   var ModalElement = function (_BaseElement) {
     babelHelpers.inherits(ModalElement, _BaseElement);

     function ModalElement() {
       babelHelpers.classCallCheck(this, ModalElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ModalElement).apply(this, arguments));
     }

     babelHelpers.createClass(ModalElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           _this2._compile();
         });

         this._doorLock = new DoorLock();

         this._animatorFactory = new AnimatorFactory({
           animators: _animatorDict$2,
           baseClass: ModalAnimator,
           baseClassName: 'ModalAnimator',
           defaultAnimation: this.getAttribute('animation')
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         this.style.display = 'none';
         this.style.zIndex = 10001;
         this.classList.add('modal');

         if (!util.findChild(this, '.modal__content')) {
           var content = document.createElement('div');
           content.classList.add('modal__content');

           while (this.childNodes[0]) {
             var node = this.childNodes[0];
             this.removeChild(node);
             content.insertBefore(node, null);
           }

           this.appendChild(content);
         }

         ModifierUtil.initModifier(this, scheme$11);
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         if (this._backButtonHandler) {
           this._backButtonHandler.destroy();
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this.onDeviceBackButton = function () {
           return undefined;
         };
       }
     }, {
       key: 'show',

       value: function show() {
         var _this3 = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         options.animationOptions = util.extend(options.animationOptions || {}, 
          AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

         var callback = options.callback || function () {};

         var tryShow = function tryShow() {
           var unlock = _this3._doorLock.lock();
           var animator = _this3._animatorFactory.newAnimator(options);

           return new Promise(function (resolve) {
             contentReady(_this3, function () {
               _this3.style.display = 'table';
               animator.show(_this3, function () {
                 unlock();

                 callback();
                 resolve(_this3);
               });
             });
           });
         };

         return new Promise(function (resolve) {
           _this3._doorLock.waitUnlock(function () {
             return resolve(tryShow());
           });
         });
       }
     }, {
       key: 'toggle',
       value: function toggle() {
         if (this.visible) {
           return this.hide.apply(this, arguments);
         } else {
           return this.show.apply(this, arguments);
         }
       }
     }, {
       key: 'hide',
       value: function hide() {
         var _this4 = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         options.animationOptions = util.extend(options.animationOptions || {}, 
          AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

         var callback = options.callback || function () {};

         var tryHide = function tryHide() {
           var unlock = _this4._doorLock.lock();
           var animator = _this4._animatorFactory.newAnimator(options);

           return new Promise(function (resolve) {
             contentReady(_this4, function () {
               animator.hide(_this4, function () {
                 _this4.style.display = 'none';
                 unlock();

                 callback();
                 resolve(_this4);
               });
             });
           });
         };

         return new Promise(function (resolve) {
           _this4._doorLock.waitUnlock(function () {
             return resolve(tryHide());
           });
         });
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$11);
         }
       }
     }, {
       key: 'onDeviceBackButton',
       get: function get() {
         return this._backButtonHandler;
       },
       set: function set(handler) {
         if (this._backButtonHandler) {
           this._backButtonHandler.destroy();
         }

         this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, handler);
       }
     }, {
       key: 'visible',
       get: function get() {
         return this.style.display !== 'none';
       }
     }], [{
       key: 'registerAnimator',
       value: function registerAnimator(name, Animator) {
         if (!(Animator.prototype instanceof ModalAnimator)) {
           throw new Error('"Animator" param must inherit OnsModalElement.ModalAnimator');
         }
         _animatorDict$2[name] = Animator;
       }
     }, {
       key: 'observedAttributes',
       get: function get() {
         return ['modifier'];
       }
     }, {
       key: 'ModalAnimator',
       get: function get() {
         return ModalAnimator;
       }
     }]);
     return ModalElement;
   }(BaseElement);

   customElements.define('ons-modal', ModalElement);

   var NavigatorTransitionAnimator = function () {
     function NavigatorTransitionAnimator(options) {
       babelHelpers.classCallCheck(this, NavigatorTransitionAnimator);

       options = util.extend({
         timing: 'linear',
         duration: '0.4',
         delay: '0'
       }, options || {});

       this.timing = options.timing;
       this.duration = options.duration;
       this.delay = options.delay;
     }

     babelHelpers.createClass(NavigatorTransitionAnimator, [{
       key: 'push',
       value: function push(enterPage, leavePage, callback) {
         callback();
       }
     }, {
       key: 'pop',
       value: function pop(enterPage, leavePage, callback) {
         callback();
       }
     }], [{
       key: 'extend',
       value: function extend() {
         var properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         var extendedAnimator = this;
         var newAnimator = function newAnimator() {
           extendedAnimator.apply(this, arguments);
           util.extend(this, properties);
         };

         newAnimator.prototype = this.prototype;

         return newAnimator;
       }
     }]);
     return NavigatorTransitionAnimator;
   }();

   var IOSSlideNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
     babelHelpers.inherits(IOSSlideNavigatorTransitionAnimator, _NavigatorTransitionA);

     function IOSSlideNavigatorTransitionAnimator(options) {
       babelHelpers.classCallCheck(this, IOSSlideNavigatorTransitionAnimator);

       options = util.extend({
         duration: 0.4,
         timing: 'ease',
         delay: 0
       }, options || {});

       var _this = babelHelpers.possibleConstructorReturn(this, 
        Object.getPrototypeOf(IOSSlideNavigatorTransitionAnimator).call(this, options));

       _this.backgroundMask = util.createElement(
        '<div style="position: absolute; width: 100%; height: 100%;background-color: black; opacity: 0; z-index: 2"></div>');
       return _this;
     }

     babelHelpers.createClass(IOSSlideNavigatorTransitionAnimator, [{
       key: '_decompose',
       value: function _decompose(page) {
         var toolbar = page._getToolbarElement();
         var left = toolbar._getToolbarLeftItemsElement();
         var right = toolbar._getToolbarRightItemsElement();

         var excludeBackButton = function excludeBackButton(elements) {
           var result = [];

           for (var i = 0; i < elements.length; i++) {
             if (elements[i].nodeName.toLowerCase() !== 'ons-back-button') {
               result.push(elements[i]);
             }
           }

           return result;
         };

         var other = [].concat(left.children.length === 0 ? left : 
          excludeBackButton(left.children)).concat(right.children.length === 0 ? right : excludeBackButton(right.children));

         return {
           toolbarCenter: toolbar._getToolbarCenterItemsElement(),
           backButtonIcon: toolbar._getToolbarBackButtonIconElement(),
           backButtonLabel: toolbar._getToolbarBackButtonLabelElement(),
           other: other,
           content: page._getContentElement(),
           background: page._getBackgroundElement(),
           toolbar: toolbar,
           bottomToolbar: page._getBottomToolbarElement()
         };
       }
     }, {
       key: '_shouldAnimateToolbar',
       value: function _shouldAnimateToolbar(enterPage, leavePage) {
         var bothPageHasToolbar = enterPage._canAnimateToolbar() && leavePage._canAnimateToolbar();

         var noMaterialToolbar = !enterPage._getToolbarElement().classList.contains('navigation-bar--material') && 
          !leavePage._getToolbarElement().classList.contains('navigation-bar--material');

         return bothPageHasToolbar && noMaterialToolbar;
       }
     }, {
       key: '_calculateDelta',
       value: function _calculateDelta(element, decomposition) {
         var title = void 0,
             label = void 0;

         var pageRect = element.getBoundingClientRect();
         if (decomposition.backButtonLabel.classList.contains('back-button__label')) {
           var labelRect = decomposition.backButtonLabel.getBoundingClientRect();
           title = Math.round(pageRect.width / 2 - labelRect.width / 2 - labelRect.left);
         } else {
           title = Math.round(pageRect.width / 2 * 0.6);
         }

         if (decomposition.backButtonIcon.classList.contains('back-button__icon')) {
           label = decomposition.backButtonIcon.getBoundingClientRect().right - 2;
         }

         return { title: title, label: label };
       }
     }, {
       key: 'push',
       value: function push(enterPage, leavePage, callback) {
         var _this2 = this;

         this.backgroundMask.remove();
         leavePage.parentNode.insertBefore(this.backgroundMask, leavePage.nextSibling);

         contentReady(enterPage, function () {
           var enterPageDecomposition = _this2._decompose(enterPage);
           var leavePageDecomposition = _this2._decompose(leavePage);

           var delta = _this2._calculateDelta(leavePage, enterPageDecomposition);

           var maskClear = animit(_this2.backgroundMask).saveStyle().queue({
             opacity: 0,
             transform: 'translate3d(0, 0, 0)'
           }).wait(_this2.delay).queue({
             opacity: 0.05
           }, {
             duration: _this2.duration,
             timing: _this2.timing
           }).restoreStyle().queue(function (done) {
             _this2.backgroundMask.remove();
             done();
           });

           var shouldAnimateToolbar = _this2._shouldAnimateToolbar(enterPage, leavePage);

           if (shouldAnimateToolbar) {
             var enterPageToolbarHeight = enterPageDecomposition.toolbar.getBoundingClientRect().height + 'px';
             _this2.backgroundMask.style.top = enterPageToolbarHeight;

             animit.runAll(maskClear, animit([enterPageDecomposition.content, enterPageDecomposition.bottomToolbar, 
              enterPageDecomposition.background]).saveStyle().queue({
               css: {
                 transform: 'translate3D(100%, 0px, 0px)'
               },
               duration: 0
             }).wait(_this2.delay).queue({
               css: {
                 transform: 'translate3D(0px, 0px, 0px)'
               },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle(), animit(enterPageDecomposition.toolbar).saveStyle().queue({
               css: {
                 opacity: 0
               },
               duration: 0
             }).queue({
               css: {
                 opacity: 1
               },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle(), animit(enterPageDecomposition.background).queue({
               css: {
                 top: enterPageToolbarHeight
               },
               duration: 0
             }), animit(enterPageDecomposition.toolbarCenter).saveStyle().queue({
               css: {
                 transform: 'translate3d(125%, 0, 0)',
                 opacity: 1
               },
               duration: 0
             }).wait(_this2.delay).queue({
               css: {
                 transform: 'translate3d(0, 0, 0)',
                 opacity: 1.0
               },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle(), animit(enterPageDecomposition.backButtonLabel).saveStyle().queue({
               css: {
                 transform: 'translate3d(' + delta.title + 'px, 0, 0)',
                 opacity: 0
               },
               duration: 0
             }).wait(_this2.delay).queue({
               css: {
                 transform: 'translate3d(0, 0, 0)',
                 opacity: 1.0
               },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle(), animit(enterPageDecomposition.other).saveStyle().queue({
               css: { opacity: 0 },
               duration: 0
             }).wait(_this2.delay).queue({
               css: { opacity: 1 },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle(), animit([leavePageDecomposition.content, leavePageDecomposition.bottomToolbar, 
              leavePageDecomposition.background]).saveStyle().queue({
               css: {
                 transform: 'translate3D(0, 0, 0)'
               },
               duration: 0
             }).wait(_this2.delay).queue({
               css: {
                 transform: 'translate3D(-25%, 0px, 0px)'
               },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle().queue(function (done) {
               callback();
               done();
             }), animit(leavePageDecomposition.toolbarCenter).saveStyle().queue({
               css: {
                 transform: 'translate3d(0, 0, 0)',
                 opacity: 1.0
               },
               duration: 0
             }).wait(_this2.delay).queue({
               css: {
                 transform: 'translate3d(-' + delta.title + 'px, 0, 0)',
                 opacity: 0
               },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle(), animit(leavePageDecomposition.backButtonLabel).saveStyle().queue({
               css: {
                 transform: 'translate3d(0, 0, 0)',
                 opacity: 1.0
               },
               duration: 0
             }).wait(_this2.delay).queue({
               css: {
                 transform: 'translate3d(-' + delta.label + 'px, 0, 0)',
                 opacity: 0
               },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle(), animit(leavePageDecomposition.other).saveStyle().queue({
               css: { opacity: 1 },
               duration: 0
             }).wait(_this2.delay).queue({
               css: { opacity: 0 },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle());
           } else {
             animit.runAll(maskClear, animit(enterPage).saveStyle().queue({
               css: {
                 transform: 'translate3D(100%, 0px, 0px)'
               },
               duration: 0
             }).wait(_this2.delay).queue({
               css: {
                 transform: 'translate3D(0px, 0px, 0px)'
               },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle(), animit(leavePage).saveStyle().queue({
               css: {
                 transform: 'translate3D(0, 0, 0)'
               },
               duration: 0
             }).wait(_this2.delay).queue({
               css: {
                 transform: 'translate3D(-25%, 0px, 0px)'
               },
               duration: _this2.duration,
               timing: _this2.timing
             }).restoreStyle().queue(function (done) {
               callback();
               done();
             }));
           }
         });
       }
     }, {
       key: 'pop',
       value: function pop(enterPage, leavePage, done) {
         this.backgroundMask.remove();
         enterPage.parentNode.insertBefore(this.backgroundMask, enterPage.nextSibling);

         var enterPageDecomposition = this._decompose(enterPage);
         var leavePageDecomposition = this._decompose(leavePage);

         var delta = this._calculateDelta(leavePage, leavePageDecomposition);

         var maskClear = animit(this.backgroundMask).saveStyle().queue({
           opacity: 0.1,
           transform: 'translate3d(0, 0, 0)'
         }).wait(this.delay).queue({
           opacity: 0
         }, {
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           done();
         });

         var shouldAnimateToolbar = this._shouldAnimateToolbar(enterPage, leavePage);

         if (shouldAnimateToolbar) {
           var enterPageToolbarHeight = enterPageDecomposition.toolbar.getBoundingClientRect().height + 'px';
           this.backgroundMask.style.top = enterPageToolbarHeight;

           animit.runAll(maskClear, animit([enterPageDecomposition.content, enterPageDecomposition.bottomToolbar,
            enterPageDecomposition.background]).saveStyle().queue({
             css: {
               transform: 'translate3D(-25%, 0px, 0px)',
               opacity: 0.9
             },
             duration: 0
           }).wait(this.delay).queue({
             css: {
               transform: 'translate3D(0px, 0px, 0px)',
               opacity: 1.0
             },
             duration: this.duration,
             timing: this.timing
           }).restoreStyle(), animit(enterPageDecomposition.toolbarCenter).saveStyle().queue({
             css: {
               transform: 'translate3d(-' + delta.title + 'px, 0, 0)',
               opacity: 0
             },
             duration: 0
           }).wait(this.delay).queue({
             css: {
               transform: 'translate3d(0, 0, 0)',
               opacity: 1.0
             },
             duration: this.duration,
             timing: this.timing
           }).restoreStyle(), animit(enterPageDecomposition.backButtonLabel).saveStyle().queue({
             css: {
               transform: 'translate3d(-' + delta.label + 'px, 0, 0)'
             },
             duration: 0
           }).wait(this.delay).queue({
             css: {
               transform: 'translate3d(0, 0, 0)'
             },
             duration: this.duration,
             timing: this.timing
           }).restoreStyle(), animit(enterPageDecomposition.other).saveStyle().queue({
             css: { opacity: 0 },
             duration: 0
           }).wait(this.delay).queue({
             css: { opacity: 1 },
             duration: this.duration,
             timing: this.timing
           }).restoreStyle(), animit(leavePageDecomposition.background).queue({
             css: {
               top: enterPageToolbarHeight
             },
             duration: 0
           }), animit([leavePageDecomposition.content, leavePageDecomposition.bottomToolbar,
            leavePageDecomposition.background]).queue({
             css: {
               transform: 'translate3D(0px, 0px, 0px)'
             },
             duration: 0
           }).wait(this.delay).queue({
             css: {
               transform: 'translate3D(100%, 0px, 0px)'
             },
             duration: this.duration,
             timing: this.timing
           }).wait(0).queue(function (finish) {
             this.backgroundMask.remove();
             done();
             finish();
           }.bind(this)), animit(leavePageDecomposition.toolbar).queue({
             css: {
               opacity: 1
             },
             duration: 0
           }).queue({
             css: {
               opacity: 0
             },
             duration: this.duration,
             timing: this.timing
           }), animit(leavePageDecomposition.toolbarCenter).queue({
             css: {
               transform: 'translate3d(0, 0, 0)'
             },
             duration: 0
           }).wait(this.delay).queue({
             css: {
               transform: 'translate3d(125%, 0, 0)'
             },
             duration: this.duration,
             timing: this.timing
           }), animit(leavePageDecomposition.backButtonLabel).queue({
             css: {
               transform: 'translate3d(0, 0, 0)',
               opacity: 1
             },
             duration: 0
           }).wait(this.delay).queue({
             css: {
               transform: 'translate3d(' + delta.title + 'px, 0, 0)',
               opacity: 0
             },
             duration: this.duration,
             timing: this.timing
           }));
         } else {
           animit.runAll(maskClear, animit(enterPage).saveStyle().queue({
             css: {
               transform: 'translate3D(-25%, 0px, 0px)',
               opacity: 0.9
             },
             duration: 0
           }).wait(this.delay).queue({
             css: {
               transform: 'translate3D(0px, 0px, 0px)',
               opacity: 1.0
             },
             duration: this.duration,
             timing: this.timing
           }).restoreStyle(), animit(leavePage).queue({
             css: {
               transform: 'translate3D(0px, 0px, 0px)'
             },
             duration: 0
           }).wait(this.delay).queue({
             css: {
               transform: 'translate3D(100%, 0px, 0px)'
             },
             duration: this.duration,
             timing: this.timing
           }).queue(function (finish) {
             this.backgroundMask.remove();
             done();
             finish();
           }.bind(this)));
         }
       }
     }]);
     return IOSSlideNavigatorTransitionAnimator;
   }(NavigatorTransitionAnimator);

   var IOSLiftNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
     babelHelpers.inherits(IOSLiftNavigatorTransitionAnimator, _NavigatorTransitionA);

     function IOSLiftNavigatorTransitionAnimator(options) {
       babelHelpers.classCallCheck(this, IOSLiftNavigatorTransitionAnimator);

       options = util.extend({
         duration: 0.4,
         timing: 'cubic-bezier(.1, .7, .1, 1)',
         delay: 0
       }, options || {});

       var _this = babelHelpers.possibleConstructorReturn(this, 
        Object.getPrototypeOf(IOSLiftNavigatorTransitionAnimator).call(this, options));

       _this.backgroundMask = util.createElement(
        '<div style="position: absolute; width: 100%; height: 100%;background: linear-gradient(black, white);"></div>');
       return _this;
     }

     babelHelpers.createClass(IOSLiftNavigatorTransitionAnimator, [{
       key: 'push',
       value: function push(enterPage, leavePage, callback) {
         var _this2 = this;

         this.backgroundMask.remove();
         leavePage.parentNode.insertBefore(this.backgroundMask, leavePage);

         var maskClear = animit(this.backgroundMask).wait(this.delay + this.duration).queue(function (done) {
           _this2.backgroundMask.remove();
           done();
         });

         animit.runAll(maskClear, animit(enterPage).saveStyle().queue({
           css: {
             transform: 'translate3D(0, 100%, 0)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 0, 0)'
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }), animit(leavePage).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 1.0
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, -10%, 0)',
             opacity: 0.9
           },
           duration: this.duration,
           timing: this.timing
         }));
       }
     }, {
       key: 'pop',
       value: function pop(enterPage, leavePage, callback) {
         var _this3 = this;

         this.backgroundMask.remove();
         enterPage.parentNode.insertBefore(this.backgroundMask, enterPage);

         animit.runAll(animit(this.backgroundMask).wait(this.delay + this.duration).queue(function (done) {
           _this3.backgroundMask.remove();
           done();
         }), animit(enterPage).queue({
           css: {
             transform: 'translate3D(0, -10%, 0)',
             opacity: 0.9
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 1.0
           },
           duration: this.duration,
           timing: this.timing
         }).queue(function (done) {
           callback();
           done();
         }), animit(leavePage).queue({
           css: {
             transform: 'translate3D(0, 0, 0)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 100%, 0)'
           },
           duration: this.duration,
           timing: this.timing
         }));
       }
     }]);
     return IOSLiftNavigatorTransitionAnimator;
   }(NavigatorTransitionAnimator);

   var IOSFadeNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
     babelHelpers.inherits(IOSFadeNavigatorTransitionAnimator, _NavigatorTransitionA);

     function IOSFadeNavigatorTransitionAnimator(options) {
       babelHelpers.classCallCheck(this, IOSFadeNavigatorTransitionAnimator);

       options = util.extend({
         timing: 'linear',
         duration: '0.4',
         delay: '0'
       }, options || {});

       return babelHelpers.possibleConstructorReturn(this, 
        Object.getPrototypeOf(IOSFadeNavigatorTransitionAnimator).call(this, options));
     }

     babelHelpers.createClass(IOSFadeNavigatorTransitionAnimator, [{
       key: 'push',
       value: function push(enterPage, leavePage, callback) {
         animit.runAll(animit([enterPage._getContentElement(), enterPage._getBackgroundElement()]).saveStyle().queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 0
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 1
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }), animit(enterPage._getToolbarElement()).saveStyle().queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 0
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 1
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle());
       }
     }, {
       key: 'pop',
       value: function pop(enterPage, leavePage, callback) {
         animit.runAll(animit([leavePage._getContentElement(), leavePage._getBackgroundElement()]).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 1
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 0
           },
           duration: this.duration,
           timing: this.timing
         }).queue(function (done) {
           callback();
           done();
         }), animit(leavePage._getToolbarElement()).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 1
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 0
           },
           duration: this.duration,
           timing: this.timing
         }));
       }
     }]);
     return IOSFadeNavigatorTransitionAnimator;
   }(NavigatorTransitionAnimator);

   var MDSlideNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
     babelHelpers.inherits(MDSlideNavigatorTransitionAnimator, _NavigatorTransitionA);

     function MDSlideNavigatorTransitionAnimator(options) {
       babelHelpers.classCallCheck(this, MDSlideNavigatorTransitionAnimator);

       options = util.extend({
         duration: 0.3,
         timing: 'cubic-bezier(.1, .7, .4, 1)',
         delay: 0
       }, options || {});

       var _this = babelHelpers.possibleConstructorReturn(this, 
        Object.getPrototypeOf(MDSlideNavigatorTransitionAnimator).call(this, options));

       _this.backgroundMask = util.createElement(
        '<div style="position:absolute;width:100%;height:100%;z-index:2;background-color:black;opacity:0;"></div>');
       _this.blackMaskOpacity = 0.4;
       return _this;
     }

     babelHelpers.createClass(MDSlideNavigatorTransitionAnimator, [{
       key: 'push',
       value: function push(enterPage, leavePage, callback) {
         var _this2 = this;

         this.backgroundMask.remove();
         leavePage.parentElement.insertBefore(this.backgroundMask, leavePage.nextSibling);

         animit.runAll(animit(this.backgroundMask).saveStyle().queue({
           opacity: 0,
           transform: 'translate3d(0, 0, 0)'
         }).wait(this.delay).queue({
           opacity: this.blackMaskOpacity
         }, {
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           _this2.backgroundMask.remove();
           done();
         }), animit(enterPage).saveStyle().queue({
           css: {
             transform: 'translate3D(100%, 0, 0)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 0, 0)'
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle(), animit(leavePage).saveStyle().queue({
           css: {
             transform: 'translate3D(0, 0, 0)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(-45%, 0px, 0px)'
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().wait(0.2).queue(function (done) {
           callback();
           done();
         }));
       }
     }, {
       key: 'pop',
       value: function pop(enterPage, leavePage, done) {
         var _this3 = this;

         this.backgroundMask.remove();
         enterPage.parentNode.insertBefore(this.backgroundMask, enterPage.nextSibling);

         animit.runAll(animit(this.backgroundMask).saveStyle().queue({
           opacity: this.blackMaskOpacity,
           transform: 'translate3d(0, 0, 0)'
         }).wait(this.delay).queue({
           opacity: 0
         }, {
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           _this3.backgroundMask.remove();
           done();
         }), animit(enterPage).saveStyle().queue({
           css: {
             transform: 'translate3D(-45%, 0px, 0px)',
             opacity: 0.9
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0px, 0px, 0px)',
             opacity: 1.0
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle(), animit(leavePage).queue({
           css: {
             transform: 'translate3D(0px, 0px, 0px)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(100%, 0px, 0px)'
           },
           duration: this.duration,
           timing: this.timing
         }).wait(0.2).queue(function (finish) {
           done();
           finish();
         }));
       }
     }]);
     return MDSlideNavigatorTransitionAnimator;
   }(NavigatorTransitionAnimator);

   var MDLiftNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
     babelHelpers.inherits(MDLiftNavigatorTransitionAnimator, _NavigatorTransitionA);

     function MDLiftNavigatorTransitionAnimator(options) {
       babelHelpers.classCallCheck(this, MDLiftNavigatorTransitionAnimator);

       options = util.extend({
         duration: 0.4,
         timing: 'cubic-bezier(.1, .7, .1, 1)',
         delay: 0.05
       }, options || {});

       var _this = babelHelpers.possibleConstructorReturn(this, 
        Object.getPrototypeOf(MDLiftNavigatorTransitionAnimator).call(this, options));

       _this.backgroundMask = util.createElement(
        '<div style="position: absolute; width: 100%; height: 100%; background-color: black;"></div>');
       return _this;
     }

     babelHelpers.createClass(MDLiftNavigatorTransitionAnimator, [{
       key: 'push',
       value: function push(enterPage, leavePage, callback) {
         var _this2 = this;

         this.backgroundMask.remove();
         leavePage.parentNode.insertBefore(this.backgroundMask, leavePage);

         var maskClear = animit(this.backgroundMask).wait(this.delay + this.duration).queue(function (done) {
           _this2.backgroundMask.remove();
           done();
         });

         animit.runAll(maskClear, animit(enterPage).saveStyle().queue({
           css: {
             transform: 'translate3D(0, 100%, 0)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 0, 0)'
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }), animit(leavePage).queue({
           css: {
             opacity: 1.0
           },
           duration: 0
         }).queue({
           css: {
             opacity: 0.4
           },
           duration: this.duration,
           timing: this.timing
         }));
       }
     }, {
       key: 'pop',
       value: function pop(enterPage, leavePage, callback) {
         var _this3 = this;

         this.backgroundMask.remove();
         enterPage.parentNode.insertBefore(this.backgroundMask, enterPage);

         animit.runAll(animit(this.backgroundMask).wait(this.delay + this.duration).queue(function (done) {
           _this3.backgroundMask.remove();
           done();
         }), animit(enterPage).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 0.4
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 1.0
           },
           duration: this.duration,
           timing: this.timing
         }).queue(function (done) {
           callback();
           done();
         }), animit(leavePage).queue({
           css: {
             transform: 'translate3D(0, 0, 0)'
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 100%, 0)'
           },
           duration: this.duration,
           timing: this.timing
         }));
       }
     }]);
     return MDLiftNavigatorTransitionAnimator;
   }(NavigatorTransitionAnimator);

   var MDFadeNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
     babelHelpers.inherits(MDFadeNavigatorTransitionAnimator, _NavigatorTransitionA);

     function MDFadeNavigatorTransitionAnimator(options) {
       babelHelpers.classCallCheck(this, MDFadeNavigatorTransitionAnimator);

       options = util.extend({
         timing: 'ease-out',
         duration: '0.25',
         delay: '0'
       }, options || {});

       return babelHelpers.possibleConstructorReturn(this, 
        Object.getPrototypeOf(MDFadeNavigatorTransitionAnimator).call(this, options));
     }

     babelHelpers.createClass(MDFadeNavigatorTransitionAnimator, [{
       key: 'push',
       value: function push(enterPage, leavePage, callback) {
         animit.runAll(animit(enterPage).saveStyle().queue({
           css: {
             transform: 'translate3D(0, 42px, 0)',
             opacity: 0
           },
           duration: 0
         }).wait(this.delay).queue({
           css: {
             transform: 'translate3D(0, 0, 0)',
             opacity: 1
           },
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (done) {
           callback();
           done();
         }));
       }
     }, {
       key: 'pop',
       value: function pop(enterPage, leavePage, callback) {
         animit.runAll(animit(leavePage).queue({
           css: {
             transform: 'translate3D(0, 0, 0)'
           },
           duration: 0
         }).wait(0.15).queue({
           css: {
             transform: 'translate3D(0, 38px, 0)'
           },
           duration: this.duration,
           timing: this.timing
         }).queue(function (done) {
           callback();
           done();
         }), animit(leavePage).queue({
           css: {
             opacity: 1
           },
           duration: 0
         }).wait(0.04).queue({
           css: {
             opacity: 0
           },
           duration: this.duration,
           timing: this.timing
         }));
       }
     }]);
     return MDFadeNavigatorTransitionAnimator;
   }(NavigatorTransitionAnimator);

   var NoneNavigatorTransitionAnimator = function (_NavigatorTransitionA) {
     babelHelpers.inherits(NoneNavigatorTransitionAnimator, _NavigatorTransitionA);

     function NoneNavigatorTransitionAnimator(options) {
       babelHelpers.classCallCheck(this, NoneNavigatorTransitionAnimator);
       return babelHelpers.possibleConstructorReturn(this, 
        Object.getPrototypeOf(NoneNavigatorTransitionAnimator).call(this, options));
     }

     babelHelpers.createClass(NoneNavigatorTransitionAnimator, [{
       key: 'push',
       value: function push(enterPage, leavePage, callback) {
         callback();
       }
     }, {
       key: 'pop',
       value: function pop(enterPage, leavePage, callback) {
         callback();
       }
     }]);
     return NoneNavigatorTransitionAnimator;
   }(NavigatorTransitionAnimator);

   var _animatorDict$3 = {
     'default': function _default() {
       return platform.isAndroid() ? MDFadeNavigatorTransitionAnimator : IOSSlideNavigatorTransitionAnimator;
     },
     'slide': function slide() {
       return platform.isAndroid() ? MDSlideNavigatorTransitionAnimator : IOSSlideNavigatorTransitionAnimator;
     },
     'lift': function lift() {
       return platform.isAndroid() ? MDLiftNavigatorTransitionAnimator : IOSLiftNavigatorTransitionAnimator;
     },
     'fade': function fade() {
       return platform.isAndroid() ? MDFadeNavigatorTransitionAnimator : IOSFadeNavigatorTransitionAnimator;
     },
     'slide-ios': IOSSlideNavigatorTransitionAnimator,
     'slide-md': MDSlideNavigatorTransitionAnimator,
     'lift-ios': IOSLiftNavigatorTransitionAnimator,
     'lift-md': MDLiftNavigatorTransitionAnimator,
     'fade-ios': IOSFadeNavigatorTransitionAnimator,
     'fade-md': MDFadeNavigatorTransitionAnimator,
     'none': NoneNavigatorTransitionAnimator
   };

   var rewritables = {
     ready: function ready(navigatorElement, callback) {
       callback();
     },

     link: function link(navigatorElement, target, options, callback) {
       callback(target);
     }
   };

   var NavigatorElement = function (_BaseElement) {
     babelHelpers.inherits(NavigatorElement, _BaseElement);

     function NavigatorElement() {
       babelHelpers.classCallCheck(this, NavigatorElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(NavigatorElement).apply(this, arguments));
     }

     babelHelpers.createClass(NavigatorElement, [{
       key: 'init',
       value: function init() {
         this._isRunning = false;
         this._pageLoader = defaultPageLoader;

         this._updateAnimatorFactory();
       }
     }, {
       key: '_getPageTarget',
       value: function _getPageTarget() {
         return this._page || this.getAttribute('page');
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var _this2 = this;

         this.onDeviceBackButton = this._onDeviceBackButton.bind(this);

         rewritables.ready(this, function () {
           if (_this2.pages.length === 0 && _this2._getPageTarget()) {
             _this2.pushPage(_this2._getPageTarget(), { animation: 'none' });
           }if (_this2.pages.length > 0) {
             for (var i = 0; i < _this2.pages.length; i++) {
               if (_this2.pages[i].nodeName !== 'ONS-PAGE') {
                 throw new Error('The children of <ons-navigator> need to be of type <ons-page>');
               }
             }

             if (_this2.topPage) {
               setImmediate(function () {
                 _this2.topPage._show();
                 _this2._updateLastPageBackButton();
               });
             }
           } else {
             contentReady(_this2, function () {
               if (_this2.pages.length === 0 && _this2._getPageTarget()) {
                 _this2.pushPage(_this2._getPageTarget(), { animation: 'none' });
               }
             });
           }
         });
       }
     }, {
       key: '_updateAnimatorFactory',
       value: function _updateAnimatorFactory() {
         this._animatorFactory = new AnimatorFactory({
           animators: _animatorDict$3,
           baseClass: NavigatorTransitionAnimator,
           baseClassName: 'NavigatorTransitionAnimator',
           defaultAnimation: this.getAttribute('animation')
         });
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this._backButtonHandler.destroy();
         this._backButtonHandler = null;
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'animation') {
           this._updateAnimatorFactory();
         }
       }
     }, {
       key: 'popPage',
       value: function popPage() {
         var _this3 = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         var _preparePageAndOption = this._preparePageAndOptions(null, options);

         options = _preparePageAndOption.options;

         var popUpdate = function popUpdate() {
           return new Promise(function (resolve) {
             _this3.pages[_this3.pages.length - 1]._destroy();
             resolve();
           });
         };

         if (!options.refresh) {
           return this._popPage(options, popUpdate);
         }

         var index = this.pages.length - 2;
         var oldPage = this.pages[index];

         if (!oldPage.name) {
           throw new Error('Refresh option cannot be used with pages directly inside the Navigator. Use ons-template instead.');
         }

         return new Promise(function (resolve) {
           var options = { page: oldPage.name, parent: _this3, params: oldPage.pushedOptions.data };
           _this3._pageLoader.load(options, function (_ref) {
             var element = _ref.element;
             var unload = _ref.unload;

             element = util.extend(element, {
               name: oldPage.name,
               data: oldPage.data,
               pushedOptions: oldPage.pushedOptions,
               unload: unload
             });

             rewritables.link(_this3, element, oldPage.options, function (element) {
               _this3.insertBefore(element, oldPage ? oldPage : null);
               oldPage._destroy();
               resolve();
             });
           });
         }).then(function () {
           return _this3._popPage(options, popUpdate);
         });
       }
     }, {
       key: '_popPage',
       value: function _popPage(options) {
         var _this4 = this;

         var update = arguments.length <= 1 || arguments[1] === undefined ? function () {
           return Promise.resolve();
         } : arguments[1];

         if (this._isRunning) {
           return Promise.reject('popPage is already running.');
         }

         if (this.pages.length <= 1) {
           return Promise.reject('ons-navigator\'s page stack is empty.');
         }

         if (this._emitPrePopEvent()) {
           return Promise.reject('Canceled in prepop event.');
         }

         var length = this.pages.length;

         this._isRunning = true;

         this.pages[length - 2].updateBackButton(length - 2 > 0);

         return new Promise(function (resolve) {
           var leavePage = _this4.pages[length - 1];
           var enterPage = _this4.pages[length - 2];
           enterPage.style.display = 'block';

           options.animation = options.animation || leavePage.pushedOptions.animation;
           options.animationOptions = util.extend({}, leavePage.pushedOptions.animationOptions, options.animationOptions || {});

           if (options.data) {
             enterPage.data = util.extend({}, enterPage.data || {}, options.data || {});
           }

           var callback = function callback() {
             update().then(function () {
               _this4._isRunning = false;

               enterPage._show();
               util.triggerElementEvent(_this4, 'postpop', { leavePage: leavePage, enterPage: enterPage, navigator: _this4 });

               if (typeof options.callback === 'function') {
                 options.callback();
               }

               resolve(enterPage);
             });
           };

           leavePage._hide();
           var animator = _this4._animatorFactory.newAnimator(options);
           animator.pop(_this4.pages[length - 2], _this4.pages[length - 1], callback);
         }).catch(function () {
           return _this4._isRunning = false;
         });
       }
     }, {
       key: 'pushPage',
       value: function pushPage(page) {
         var _this5 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         var _preparePageAndOption2 = this._preparePageAndOptions(page, options);

         page = _preparePageAndOption2.page;
         options = _preparePageAndOption2.options;

         var prepare = function prepare(element, unload) {
           _this5._verifyPageElement(element);
           element = util.extend(element, {
             name: options.page,
             data: options.data,
             unload: unload
           });
           element.style.display = 'none';
         };

         if (options.pageHTML) {
           return this._pushPage(options, function () {
             return new Promise(function (resolve) {
               instantPageLoader.load({ page: options.pageHTML, parent: _this5, params: options.data }, function (_ref2) {
                 var element = _ref2.element;
                 var unload = _ref2.unload;

                 prepare(element, unload);
                 resolve();
               });
             });
           });
         }

         return this._pushPage(options, function () {
           return new Promise(function (resolve) {
             _this5._pageLoader.load({ page: page, parent: _this5, params: options.data }, function (_ref3) {
               var element = _ref3.element;
               var unload = _ref3.unload;

               prepare(element, unload);
               resolve();
             });
           });
         });
       }
     }, {
       key: '_pushPage',
       value: function _pushPage() {
         var _this6 = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
         var update = arguments.length <= 1 || arguments[1] === undefined ? function () {
           return Promise.resolve();
         } : arguments[1];

         if (this._isRunning) {
           return Promise.reject('pushPage is already running.');
         }

         if (this._emitPrePushEvent()) {
           return Promise.reject('Canceled in prepush event.');
         }

         this._isRunning = true;

         var animationOptions = AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options'));
         options = util.extend({}, this.options || {}, { animationOptions: animationOptions }, options);

         var animator = this._animatorFactory.newAnimator(options);

         return update().then(function () {
           var pageLength = _this6.pages.length;

           var enterPage = _this6.pages[pageLength - 1];
           var leavePage = _this6.pages[pageLength - 2];

           if (enterPage.nodeName !== 'ONS-PAGE') {
             throw new Error('Only elements of type <ons-page> can be pushed to the navigator');
           }

           enterPage.updateBackButton(pageLength - 1);

           enterPage.pushedOptions = util.extend({}, enterPage.pushedOptions || {}, options || {});
           enterPage.data = util.extend({}, enterPage.data || {}, options.data || {});
           enterPage.name = enterPage.name || options.page;
           enterPage.unload = enterPage.unload || options.unload;

           return new Promise(function (resolve) {
             var done = function done() {
               _this6._isRunning = false;

               if (leavePage) {
                 leavePage.style.display = 'none';
               }

               setImmediate(function () {
                 return enterPage._show();
               });
               util.triggerElementEvent(_this6, 'postpush', { leavePage: leavePage, enterPage: enterPage, navigator: _this6 });

               if (typeof options.callback === 'function') {
                 options.callback();
               }

               resolve(enterPage);
             };

             enterPage.style.display = 'none';

             var push = function push() {
               enterPage.style.display = 'block';
               if (leavePage) {
                 leavePage._hide();
                 animator.push(enterPage, leavePage, done);
               } else {
                 done();
               }
             };

             options._linked ? push() : rewritables.link(_this6, enterPage, options, push);
           });
         }).catch(function (error) {
           _this6._isRunning = false;
           throw error;
         });
       }
     }, {
       key: 'replacePage',
       value: function replacePage(page) {
         var _this7 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         return this.pushPage(page, options).then(function (resolvedValue) {
           if (_this7.pages.length > 1) {
             _this7.pages[_this7.pages.length - 2]._destroy();
           }
           _this7._updateLastPageBackButton();

           return Promise.resolve(resolvedValue);
         });
       }
     }, {
       key: 'insertPage',
       value: function insertPage(index, page) {
         var _this8 = this;

         var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

         var _preparePageAndOption3 = this._preparePageAndOptions(page, options);

         page = _preparePageAndOption3.page;
         options = _preparePageAndOption3.options;

         index = this._normalizeIndex(index);

         if (index >= this.pages.length) {
           return this.pushPage(page, options);
         }

         page = typeof options.pageHTML === 'string' ? options.pageHTML : page;
         var loader = typeof options.pageHTML === 'string' ? instantPageLoader : this._pageLoader;

         return new Promise(function (resolve) {
           loader.load({ page: page, parent: _this8 }, function (_ref4) {
             var element = _ref4.element;
             var unload = _ref4.unload;

             _this8._verifyPageElement(element);
             element = util.extend(element, {
               name: options.page,
               data: options.data,
               pushedOptions: options,
               unload: unload
             });

             options.animationOptions = util.extend({}, 
              AnimatorFactory.parseAnimationOptionsString(_this8.getAttribute('animation-options')), options.animationOptions || {});

             element.style.display = 'none';
             _this8.insertBefore(element, _this8.pages[index]);
             _this8.topPage.updateBackButton(true);

             rewritables.link(_this8, element, options, function (element) {
               setTimeout(function () {
                 element = null;
                 resolve(_this8.pages[index]);
               }, 1000 / 60);
             });
           });
         });
       }
     }, {
       key: 'resetToPage',
       value: function resetToPage(page) {
         var _this9 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         var _preparePageAndOption4 = this._preparePageAndOptions(page, options);

         page = _preparePageAndOption4.page;
         options = _preparePageAndOption4.options;

         if (!options.animator && !options.animation) {
           options.animation = 'none';
         }

         var callback = options.callback;

         options.callback = function () {
           while (_this9.pages.length > 1) {
             _this9.pages[0]._destroy();
           }

           _this9.pages[0].updateBackButton(false);
           callback && callback();
         };

         if (!options.page && !options.pageHTML && this._getPageTarget()) {
           page = options.page = this._getPageTarget();
         }

         return this.pushPage(page, options);
       }
     }, {
       key: 'bringPageTop',
       value: function bringPageTop(item) {
         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         if (['number', 'string'].indexOf(typeof item === 'undefined' ? 'undefined' : babelHelpers.typeof(item)) === -1) {
           throw new Error('First argument must be a page name or the index of an existing page. You supplied ' + item);
         }
         var index = typeof item === 'number' ? this._normalizeIndex(item) : this._lastIndexOfPage(item);
         var page = this.pages[index];

         if (index < 0) {
           return this.pushPage(item, options);
         }

         var _preparePageAndOption5 = this._preparePageAndOptions(page, options);

         options = _preparePageAndOption5.options;

         if (index === this.pages.length - 1) {
           return Promise.resolve(page);
         }
         if (!page) {
           throw new Error('Failed to find item ' + item);
         }
         if (this._isRunning) {
           return Promise.reject('pushPage is already running.');
         }
         if (this._emitPrePushEvent()) {
           return Promise.reject('Canceled in prepush event.');
         }

         util.extend(options, {
           page: page.name,
           _linked: true
         });
         page.style.display = 'none';
         page.setAttribute('_skipinit', '');
         page.parentNode.appendChild(page);
         return this._pushPage(options);
       }
     }, {
       key: '_preparePageAndOptions',
       value: function _preparePageAndOptions(page) {
         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         if ((typeof options === 'undefined' ? 'undefined' : babelHelpers.typeof(options)) != 'object') {
           throw new Error('options must be an object. You supplied ' + options);
         }

         if ((page === null || page === undefined) && options.page) {
           page = options.page;
         }

         options = util.extend({}, this.options || {}, options, { page: page });

         return { page: page, options: options };
       }
     }, {
       key: '_updateLastPageBackButton',
       value: function _updateLastPageBackButton() {
         var index = this.pages.length - 1;
         if (index >= 0) {
           this.pages[index].updateBackButton(index > 0);
         }
       }
     }, {
       key: '_normalizeIndex',
       value: function _normalizeIndex(index) {
         return index >= 0 ? index : Math.abs(this.pages.length + index) % this.pages.length;
       }
     }, {
       key: '_onDeviceBackButton',
       value: function _onDeviceBackButton(event) {
         if (this.pages.length > 1) {
           this.popPage();
         } else {
           event.callParentHandler();
         }
       }
     }, {
       key: '_lastIndexOfPage',
       value: function _lastIndexOfPage(pageName) {
         var index = void 0;
         for (index = this.pages.length - 1; index >= 0; index--) {
           if (this.pages[index].name === pageName) {
             break;
           }
         }
         return index;
       }
     }, {
       key: '_emitPreEvent',
       value: function _emitPreEvent(name) {
         var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         var isCanceled = false;

         util.triggerElementEvent(this, 'pre' + name, util.extend({
           navigator: this,
           currentPage: this.pages[this.pages.length - 1],
           cancel: function cancel() {
             return isCanceled = true;
           }
         }, data));

         return isCanceled;
       }
     }, {
       key: '_emitPrePushEvent',
       value: function _emitPrePushEvent() {
         return this._emitPreEvent('push');
       }
     }, {
       key: '_emitPrePopEvent',
       value: function _emitPrePopEvent() {
         var l = this.pages.length;
         return this._emitPreEvent('pop', {
           leavePage: this.pages[l - 1],
           enterPage: this.pages[l - 2]
         });
       }
     }, {
       key: '_createPageElement',
       value: function _createPageElement(templateHTML) {
         var pageElement = util.createElement(internal.normalizePageHTML(templateHTML));
         this._verifyPageElement(pageElement);
         return pageElement;
       }
     }, {
       key: '_verifyPageElement',
       value: function _verifyPageElement(element) {
         if (element.nodeName.toLowerCase() !== 'ons-page') {
           throw new Error('You must supply an "ons-page" element to "ons-navigator".');
         }
       }
     }, {
       key: '_show',
       value: function _show() {
         if (this.topPage) {
           this.topPage._show();
         }
       }
     }, {
       key: '_hide',
       value: function _hide() {
         if (this.topPage) {
           this.topPage._hide();
         }
       }
     }, {
       key: '_destroy',
       value: function _destroy() {
         for (var i = this.pages.length - 1; i >= 0; i--) {
           this.pages[i]._destroy();
         }

         this.remove();
       }
     }, {
       key: 'animatorFactory',

       get: function get() {
         return this._animatorFactory;
       }
     }, {
       key: 'pageLoader',
       get: function get() {
         return this._pageLoader;
       },
       set: function set(pageLoader) {
         if (!(pageLoader instanceof PageLoader)) {
           throw Error('First parameter must be an instance of PageLoader.');
         }
         this._pageLoader = pageLoader;
       }
     }, {
       key: 'page',
       get: function get() {
         return this._page;
       },
       set: function set(page) {
         this._page = page;
       }
     }, {
       key: 'onDeviceBackButton',
       get: function get() {
         return this._backButtonHandler;
       },
       set: function set(callback) {
         if (this._backButtonHandler) {
           this._backButtonHandler.destroy();
         }

         this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
       }
     }, {
       key: 'topPage',
       get: function get() {
         return this.pages[this.pages.length - 1] || null;
       }
     }, {
       key: 'pages',
       get: function get() {
         return util.arrayFrom(this.children).filter(function (n) {
           return n.tagName === 'ONS-PAGE';
         });
       }
     }, {
       key: 'options',
       get: function get() {
         return this._options;
       },
       set: function set(object) {
         this._options = object;
       }
     }, {
       key: '_isRunning',
       set: function set(value) {
         this.setAttribute('_is-running', value ? 'true' : 'false');
       },
       get: function get() {
         return JSON.parse(this.getAttribute('_is-running'));
       }
     }], [{
       key: 'registerAnimator',
       value: function registerAnimator(name, Animator) {
         if (!(Animator.prototype instanceof NavigatorTransitionAnimator)) {
           throw new Error('"Animator" param must inherit NavigatorElement.NavigatorTransitionAnimator');
         }

         _animatorDict$3[name] = Animator;
       }
     }, {
       key: 'observedAttributes',
       get: function get() {
         return ['animation'];
       }
     }, {
       key: 'animators',
       get: function get() {
         return _animatorDict$3;
       }
     }, {
       key: 'NavigatorTransitionAnimator',
       get: function get() {
         return NavigatorTransitionAnimator;
       }
     }, {
       key: 'rewritables',
       get: function get() {
         return rewritables;
       }
     }]);
     return NavigatorElement;
   }(BaseElement);

   customElements.define('ons-navigator', NavigatorElement);

   var scheme$13 = {
     '': 'navigation-bar--*',
     '.navigation-bar__left': 'navigation-bar--*__left',
     '.navigation-bar__center': 'navigation-bar--*__center',
     '.navigation-bar__right': 'navigation-bar--*__right'
   };

   var ToolbarElement = function (_BaseElement) {
     babelHelpers.inherits(ToolbarElement, _BaseElement);

     function ToolbarElement() {
       babelHelpers.classCallCheck(this, ToolbarElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ToolbarElement).apply(this, arguments));
     }

     babelHelpers.createClass(ToolbarElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           _this2._compile();
         });
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$13);
         }
       }
     }, {
       key: '_getToolbarLeftItemsElement',
       value: function _getToolbarLeftItemsElement() {
         return this.querySelector('.left') || internal.nullElement;
       }
     }, {
       key: '_getToolbarCenterItemsElement',
       value: function _getToolbarCenterItemsElement() {
         return this.querySelector('.center') || internal.nullElement;
       }
     }, {
       key: '_getToolbarRightItemsElement',
       value: function _getToolbarRightItemsElement() {
         return this.querySelector('.right') || internal.nullElement;
       }
     }, {
       key: '_getToolbarBackButtonLabelElement',
       value: function _getToolbarBackButtonLabelElement() {
         return this.querySelector('ons-back-button .back-button__label') || internal.nullElement;
       }
     }, {
       key: '_getToolbarBackButtonIconElement',
       value: function _getToolbarBackButtonIconElement() {
         return this.querySelector('ons-back-button .back-button__icon') || internal.nullElement;
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);
         this.classList.add('navigation-bar');
         this._ensureToolbarItemElements();
         ModifierUtil.initModifier(this, scheme$13);
       }
     }, {
       key: '_ensureToolbarItemElements',
       value: function _ensureToolbarItemElements() {
         for (var i = this.childNodes.length - 1; i >= 0; i--) {
           if (this.childNodes[i].nodeType != 1) {
             this.removeChild(this.childNodes[i]);
           }
         }

         var center = this._ensureToolbarElement('center');
         center.classList.add('navigation-bar__title');

         if (this.children.length !== 1 || !this.children[0].classList.contains('center')) {
           var left = this._ensureToolbarElement('left');
           var right = this._ensureToolbarElement('right');

           if (this.children[0] !== left || this.children[1] !== center || this.children[2] !== right) {
             this.appendChild(left);
             this.appendChild(center);
             this.appendChild(right);
           }
         }
       }
     }, {
       key: '_ensureToolbarElement',
       value: function _ensureToolbarElement(name) {
         if (util.findChild(this, '.navigation-bar__' + name)) {
           var _element = util.findChild(this, '.navigation-bar__' + name);
           _element.classList.add(name);
           return _element;
         }

         var element = util.findChild(this, '.' + name) || util.create('.' + name);
         element.classList.add('navigation-bar__' + name);

         return element;
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier'];
       }
     }]);
     return ToolbarElement;
   }(BaseElement);

   customElements.define('ons-toolbar', ToolbarElement);

   var scheme$12 = {
     '': 'page--*',
     '.page__content': 'page--*__content',
     '.page__background': 'page--*__background'
   };

   var nullToolbarElement = document.createElement('ons-toolbar'); // requires that 'ons-toolbar' element is registered

   var PageElement = function (_BaseElement) {
     babelHelpers.inherits(PageElement, _BaseElement);

     function PageElement() {
       babelHelpers.classCallCheck(this, PageElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(PageElement).apply(this, arguments));
     }

     babelHelpers.createClass(PageElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         this.classList.add('page');

         contentReady(this, function () {
           _this2._compile();

           _this2._isShown = false;
           _this2._contentElement = _this2._getContentElement();
           _this2._isMuted = _this2.hasAttribute('_muted');
           _this2._skipInit = _this2.hasAttribute('_skipinit');
           _this2.pushedOptions = {};
         });
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var _this3 = this;

         contentReady(this, function () {
           if (!_this3._isMuted) {
             if (_this3._skipInit) {
               _this3.removeAttribute('_skipinit');
             } else {
               setImmediate(function () {
                 return util.triggerElementEvent(_this3, 'init');
               });
             }
           }

           if (!util.hasAnyComponentAsParent(_this3)) {
             setImmediate(function () {
               return _this3._show();
             });
           }

           _this3._tryToFillStatusBar();

           if (_this3.hasAttribute('on-infinite-scroll')) {
             _this3.attributeChangedCallback('on-infinite-scroll', null, _this3.getAttribute('on-infinite-scroll'));
           }
         });
       }
     }, {
       key: 'updateBackButton',
       value: function updateBackButton(show) {
         if (this.backButton) {
           show ? this.backButton.show() : this.backButton.hide();
         }
       }
     }, {
       key: '_tryToFillStatusBar',
       value: function _tryToFillStatusBar() {
         var _this4 = this;

         internal.autoStatusBarFill(function () {
           var filled = util.findParent(_this4, function (e) {
             return e.hasAttribute('status-bar-fill');
           });
           util.toggleAttribute(_this4, 'status-bar-fill', 
            !filled && (_this4._canAnimateToolbar() || !_this4._hasAPageControlChild()));
         });
       }
     }, {
       key: '_hasAPageControlChild',
       value: function _hasAPageControlChild() {
         return util.findChild(this._contentElement, function (e) {
           return e.nodeName.match(/ons-(splitter|sliding-menu|navigator|tabbar)/i);
         });
       }
     }, {
       key: '_onScroll',
       value: function _onScroll() {
         var _this5 = this;

         var c = this._contentElement,
             overLimit = (c.scrollTop + c.clientHeight) / c.scrollHeight >= this._infiniteScrollLimit;

         if (this._onInfiniteScroll && !this._loadingContent && overLimit) {
           this._loadingContent = true;
           this._onInfiniteScroll(function () {
             return _this5._loadingContent = false;
           });
         }
       }
     }, {
       key: '_getContentElement',

       value: function _getContentElement() {
         var result = util.findChild(this, '.page__content');
         if (result) {
           return result;
         }
         throw Error('fail to get ".page__content" element.');
       }
     }, {
       key: '_canAnimateToolbar',
       value: function _canAnimateToolbar() {
         if (util.findChild(this, 'ons-toolbar')) {
           return true;
         }
         return !!util.findChild(this._contentElement, function (el) {
           return util.match(el, 'ons-toolbar') && !el.hasAttribute('inline');
         });
       }
     }, {
       key: '_getBackgroundElement',
       value: function _getBackgroundElement() {
         var result = util.findChild(this, '.page__background');
         if (result) {
           return result;
         }
         throw Error('fail to get ".page__background" element.');
       }
     }, {
       key: '_getBottomToolbarElement',
       value: function _getBottomToolbarElement() {
         return util.findChild(this, 'ons-bottom-toolbar') || internal.nullElement;
       }
     }, {
       key: '_getToolbarElement',
       value: function _getToolbarElement() {
         return util.findChild(this, 'ons-toolbar') || nullToolbarElement;
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         var _this6 = this;

         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$12);
         } else if (name === '_muted') {
           this._isMuted = this.hasAttribute('_muted');
         } else if (name === '_skipinit') {
           this._skipInit = this.hasAttribute('_skipinit');
         } else if (name === 'on-infinite-scroll') {
           if (current === null) {
             this.onInfiniteScroll = null;
           } else {
             this.onInfiniteScroll = function (done) {
               var f = util.findFromPath(current);
               _this6.onInfiniteScroll = f;
               f(done);
             };
           }
         }
       }
     }, {
       key: '_compile',
       value: function _compile() {
         var _this7 = this;

         autoStyle.prepare(this);

         if (util.findChild(this, '.content')) {
           util.findChild(this, '.content').classList.add('page__content');
         }

         if (util.findChild(this, '.background')) {
           util.findChild(this, '.background').classList.add('page__background');
         }

         if (!util.findChild(this, '.page__content')) {
           (function () {
             var content = util.create('.page__content');

             util.arrayFrom(_this7.childNodes).forEach(function (node) {
               if (node.nodeType !== 1 || _this7._elementShouldBeMoved(node)) {
                 content.appendChild(node);
               }
             });

             var prevNode = util.findChild(_this7, '.page__background') || util.findChild(_this7, 'ons-toolbar');

             _this7.insertBefore(content, prevNode && prevNode.nextSibling);
           })();
         }

         if (!util.findChild(this, '.page__background')) {
           var background = util.create('.page__background');
           this.insertBefore(background, util.findChild(this, '.page__content'));
         }

         ModifierUtil.initModifier(this, scheme$12);
       }
     }, {
       key: '_elementShouldBeMoved',
       value: function _elementShouldBeMoved(el) {
         if (el.classList.contains('page__background')) {
           return false;
         }
         var tagName = el.tagName.toLowerCase();
         if (tagName === 'ons-fab') {
           return !el.hasAttribute('position');
         }
         var fixedElements = ['ons-toolbar', 'ons-bottom-toolbar', 'ons-modal', 'ons-speed-dial'];
         return el.hasAttribute('inline') || fixedElements.indexOf(tagName) === -1;
       }
     }, {
       key: '_show',
       value: function _show() {
         if (!this._isShown && util.isAttached(this)) {
           this._isShown = true;

           if (!this._isMuted) {
             util.triggerElementEvent(this, 'show');
           }

           util.propagateAction(this._contentElement, '_show');
         }
       }
     }, {
       key: '_hide',
       value: function _hide() {
         if (this._isShown) {
           this._isShown = false;

           if (!this._isMuted) {
             util.triggerElementEvent(this, 'hide');
           }

           util.propagateAction(this._contentElement, '_hide');
         }
       }
     }, {
       key: '_destroy',
       value: function _destroy() {
         this._hide();

         if (!this._isMuted) {
           util.triggerElementEvent(this, 'destroy');
         }

         if (this.onDeviceBackButton) {
           this.onDeviceBackButton.destroy();
         }

         util.propagateAction(this._contentElement, '_destroy');

         if (this.unload instanceof Function) {
           this.unload();
         }

         this.remove();
       }
     }, {
       key: 'name',
       set: function set(str) {
         this.setAttribute('name', str);
       },
       get: function get() {
         return this.getAttribute('name');
       }
     }, {
       key: 'backButton',
       get: function get() {
         return this.querySelector('ons-back-button');
       }
     }, {
       key: 'onInfiniteScroll',
       set: function set(value) {
         if (value === null) {
           this._onInfiniteScroll = null;
           this._contentElement.removeEventListener('scroll', this._boundOnScroll);
           return;
         }
         if (!(value instanceof Function)) {
           throw new Error('onInfiniteScroll must be a function or null');
         }
         if (!this._onInfiniteScroll) {
           this._infiniteScrollLimit = 0.9;
           this._boundOnScroll = this._onScroll.bind(this);
           this._contentElement.addEventListener('scroll', this._boundOnScroll);
         }
         this._onInfiniteScroll = value;
       },
       get: function get() {
         return this._onInfiniteScroll;
       }
     }, {
       key: 'onDeviceBackButton',
       get: function get() {
         return this._backButtonHandler;
       },
       set: function set(callback) {
         if (this._backButtonHandler) {
           this._backButtonHandler.destroy();
         }

         this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', '_muted', '_skipinit', 'on-infinite-scroll'];
       }
     }]);
     return PageElement;
   }(BaseElement);

   customElements.define('ons-page', PageElement);

   var PopoverAnimator = function () {
     function PopoverAnimator() {
       var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
       babelHelpers.classCallCheck(this, PopoverAnimator);

       this.options = util.extend({
         timing: 'cubic-bezier(.1, .7, .4, 1)',
         duration: 0.2,
         delay: 0
       }, options);
     }

     babelHelpers.createClass(PopoverAnimator, [{
       key: 'show',
       value: function show(popover, callback) {
         callback();
       }
     }, {
       key: 'hide',
       value: function hide(popover, callback) {
         callback();
       }
     }, {
       key: '_animate',
       value: function _animate(element, _ref) {
         var from = _ref.from;
         var to = _ref.to;
         var options = _ref.options;
         var callback = _ref.callback;
         var _ref$restore = _ref.restore;
         var restore = _ref$restore === undefined ? false : _ref$restore;
         var animation = _ref.animation;

         options = util.extend({}, this.options, options);

         if (animation) {
           from = animation.from;
           to = animation.to;
         }

         animation = animit(element);
         if (restore) {
           animation = animation.saveStyle();
         }
         animation = animation.queue(from).wait(options.delay).queue({
           css: to,
           duration: options.duration,
           timing: options.timing
         });
         if (restore) {
           animation = animation.restoreStyle();
         }
         if (callback) {
           animation = animation.queue(function (done) {
             callback();
             done();
           });
         }
         return animation;
       }
     }, {
       key: '_animateAll',
       value: function _animateAll(element, animations) {
         var _this = this;

         Object.keys(animations).forEach(function (key) {
           return _this._animate(element[key], animations[key]).play();
         });
       }
     }]);
     return PopoverAnimator;
   }();

   var fade = {
     out: {
       from: { opacity: 1.0 },
       to: { opacity: 0 }
     },
     in: {
       from: { opacity: 0 },
       to: { opacity: 1.0 }
     }
   };

   var MDFadePopoverAnimator = function (_PopoverAnimator) {
     babelHelpers.inherits(MDFadePopoverAnimator, _PopoverAnimator);

     function MDFadePopoverAnimator() {
       babelHelpers.classCallCheck(this, MDFadePopoverAnimator);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(MDFadePopoverAnimator).apply(this, arguments));
     }

     babelHelpers.createClass(MDFadePopoverAnimator, [{
       key: 'show',
       value: function show(popover, callback) {
         this._animateAll(popover, {
           _mask: fade.in,
           _popover: { animation: fade.in, restore: true, callback: callback }
         });
       }
     }, {
       key: 'hide',
       value: function hide(popover, callback) {
         this._animateAll(popover, {
           _mask: fade.out,
           _popover: { animation: fade.out, restore: true, callback: callback }
         });
       }
     }]);
     return MDFadePopoverAnimator;
   }(PopoverAnimator);

   var IOSFadePopoverAnimator = function (_MDFadePopoverAnimato) {
     babelHelpers.inherits(IOSFadePopoverAnimator, _MDFadePopoverAnimato);

     function IOSFadePopoverAnimator() {
       babelHelpers.classCallCheck(this, IOSFadePopoverAnimator);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(IOSFadePopoverAnimator).apply(this, arguments));
     }

     babelHelpers.createClass(IOSFadePopoverAnimator, [{
       key: 'show',
       value: function show(popover, callback) {
         this._animateAll(popover, {
           _mask: fade.in,
           _popover: {
             from: {
               transform: 'scale3d(1.3, 1.3, 1.0)',
               opacity: 0
             },
             to: {
               transform: 'scale3d(1.0, 1.0,  1.0)',
               opacity: 1.0
             },
             restore: true,
             callback: callback
           }
         });
       }
     }]);
     return IOSFadePopoverAnimator;
   }(MDFadePopoverAnimator);

   var scheme$14 = {
     '.popover': 'popover--*',
     '.popover-mask': 'popover-mask--*',
     '.popover__container': 'popover__container--*',
     '.popover__content': 'popover__content--*',
     '.popover__arrow': 'popover__arrow--*'
   };

   var _animatorDict$4 = {
     'default': function _default() {
       return platform.isAndroid() ? MDFadePopoverAnimator : IOSFadePopoverAnimator;
     },
     'none': PopoverAnimator,
     'fade-ios': IOSFadePopoverAnimator,
     'fade-md': MDFadePopoverAnimator
   };

   var templateSource = util.createFragment('<div class="popover-mask"></div>' +
    '<div class="popover__container"><div class="popover__content"></div><div class="popover__arrow"></div></div>');

   var positions = {
     up: 'bottom',
     left: 'right',
     down: 'top',
     right: 'left'
   };

   var directions = Object.keys(positions);

   var PopoverElement = function (_BaseElement) {
     babelHelpers.inherits(PopoverElement, _BaseElement);

     function PopoverElement() {
       babelHelpers.classCallCheck(this, PopoverElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(PopoverElement).apply(this, arguments));
     }

     babelHelpers.createClass(PopoverElement, [{
       key: 'init',
       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           _this2._compile();
           _this2._initAnimatorFactory();
         });

         this._doorLock = new DoorLock();
         this._boundOnChange = this._onChange.bind(this);
         this._boundCancel = this._cancel.bind(this);
       }
     }, {
       key: '_initAnimatorFactory',
       value: function _initAnimatorFactory() {
         var factory = new AnimatorFactory({
           animators: _animatorDict$4,
           baseClass: PopoverAnimator,
           baseClassName: 'PopoverAnimator',
           defaultAnimation: this.getAttribute('animation') || 'default'
         });
         this._animator = function (options) {
           return factory.newAnimator(options);
         };
       }
     }, {
       key: '_positionPopover',
       value: function _positionPopover(target) {
         var radius = this._radius;
         var el = this._content;
         var margin = this._margin;

         var pos = target.getBoundingClientRect();
         var isMD = util.hasModifier(this, 'material');
         var cover = isMD && this.hasAttribute('cover-target');

         var distance = {
           top: pos.top - margin,
           left: pos.left - margin,
           right: window.innerWidth - pos.right - margin,
           bottom: window.innerHeight - pos.bottom - margin
         };

         var _calculateDirections2 = this._calculateDirections(distance);

         var vertical = _calculateDirections2.vertical;
         var primary = _calculateDirections2.primary;
         var secondary = _calculateDirections2.secondary;

         this._popover.classList.add('popover--' + primary);

         var offset = cover ? 0 : (vertical ? pos.height : pos.width) + (isMD ? 0 : 14);
         this.style[primary] = Math.max(0, distance[primary] + offset) + margin + 'px';
         el.style[primary] = 0;

         var l = vertical ? 'width' : 'height';
         var sizes = function (style) {
           return {
             width: parseInt(style.getPropertyValue('width')),
             height: parseInt(style.getPropertyValue('height'))
           };
         }(window.getComputedStyle(el));

         el.style[secondary] = Math.max(0, distance[secondary] - (sizes[l] - pos[l]) / 2) + 'px';
         this._arrow.style[secondary] = Math.max(radius, distance[secondary] + pos[l] / 2) + 'px';

         this._setTransformOrigin(distance, sizes, pos, primary);

         el.removeAttribute('data-animit-orig-style');
       }
     }, {
       key: '_setTransformOrigin',
       value: function _setTransformOrigin(distance, sizes, pos, primary) {
         var calc = function calc(a, o, l) {
           return primary === a ? sizes[l] / 2 : distance[a] + (primary === o ? -sizes[l] : sizes[l] - pos[l]) / 2;
         };
         var x = calc('left', 'right', 'width') + 'px';
         var y = calc('top', 'bottom', 'height') + 'px';

         util.extend(this._popover.style, {
           transformOrigin: x + ' ' + y,
           webkitTransformOriginX: x,
           webkitTransformOriginY: y
         });
       }
     }, {
       key: '_calculateDirections',
       value: function _calculateDirections(distance) {
         var options = (this.getAttribute('direction') || 'up down left right').split(/\s+/).map(function (e) {
           return positions[e];
         });
         var primary = options.sort(function (a, b) {
           return distance[a] - distance[b];
         })[0];
         var vertical = ['top', 'bottom'].indexOf(primary) !== -1;
         var secondary = void 0;

         if (vertical) {
           secondary = distance.left < distance.right ? 'left' : 'right';
         } else {
           secondary = distance.top < distance.bottom ? 'top' : 'bottom';
         }

         return { vertical: vertical, primary: primary, secondary: secondary };
       }
     }, {
       key: '_clearStyles',
       value: function _clearStyles() {
         var _this3 = this;

         ['top', 'bottom', 'left', 'right'].forEach(function (e) {
           _this3._arrow.style[e] = _this3._content.style[e] = _this3.style[e] = '';
           _this3._popover.classList.remove('popover--' + e);
         });
       }
     }, {
       key: '_onChange',
       value: function _onChange() {
         var _this4 = this;

         setImmediate(function () {
           if (_this4._currentTarget) {
             _this4._positionPopover(_this4._currentTarget);
           }
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         if (this.classList.contains('popover')) {
           return;
         }

         this.classList.add('popover');

         var hasDefaultContainer = this._popover && this._content;

         if (hasDefaultContainer) {
           if (!this._mask) {
             var mask = document.createElement('div');
             mask.classList.add('popover-mask');
             this.insertBefore(mask, this.firstChild);
           }

           if (!this._arrow) {
             var arrow = document.createElement('div');
             arrow.classList.add('popover__arrow');
             this._popover.appendChild(arrow);
           }
         } else {
           var template = templateSource.cloneNode(true);
           var content = template.querySelector('.popover__content');

           while (this.childNodes[0]) {
             content.appendChild(this.childNodes[0]);
           }

           this.appendChild(template);
         }

         if (this.hasAttribute('style')) {
           this._popover.setAttribute('style', this.getAttribute('style'));
           this.removeAttribute('style');
         }

         if (this.hasAttribute('mask-color')) {
           this._mask.style.backgroundColor = this.getAttribute('mask-color');
         }

         ModifierUtil.initModifier(this, scheme$14);
       }
     }, {
       key: '_prepareAnimationOptions',
       value: function _prepareAnimationOptions(options) {
         if (options.animation && !(options.animation in _animatorDict$4)) {
           throw new Error('Animator ' + options.animation + ' is not registered.');
         }

         options.animationOptions = util.extend(AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')), 
          options.animationOptions || {});
       }
     }, {
       key: '_executeAction',
       value: function _executeAction(actions) {
         var _this5 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         var callback = options.callback;
         var action = actions.action;
         var before = actions.before;
         var after = actions.after;

         this._prepareAnimationOptions(options);

         var canceled = false;
         util.triggerElementEvent(this, 'pre' + action, {
           popover: this,
           cancel: function cancel() {
             return canceled = true;
           }
         });

         if (canceled) {
           return Promise.reject('Canceled in pre' + action + ' event.');
         }

         return new Promise(function (resolve) {
           _this5._doorLock.waitUnlock(function () {
             var unlock = _this5._doorLock.lock();

             before && before();

             contentReady(_this5, function () {
               _this5._animator(options)[action](_this5, function () {
                 after && after();

                 unlock();

                 util.triggerElementEvent(_this5, 'post' + action, { popover: _this5 });

                 callback && callback();
                 resolve(_this5);
               });
             });
           });
         });
       }
     }, {
       key: 'show',
       value: function show(target) {
         var _this6 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         if (typeof target === 'string') {
           target = document.querySelector(target);
         } else if (target instanceof Event) {
           target = target.target;
         }
         if (!(target instanceof HTMLElement)) {
           throw new Error('Invalid target');
         }

         return this._executeAction({
           action: 'show',
           before: function before() {
             _this6.style.display = 'block';
             _this6._currentTarget = target;
             _this6._positionPopover(target);
           }
         }, options);
       }
     }, {
       key: 'hide',
       value: function hide() {
         var _this7 = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         return this._executeAction({
           action: 'hide',
           after: function after() {
             _this7.style.display = 'none';
             _this7._clearStyles();
           }
         }, options);
       }
     }, {
       key: '_resetBackButtonHandler',
       value: function _resetBackButtonHandler() {
         var _this8 = this;

         this.onDeviceBackButton = function (e) {
           return _this8.cancelable ? _this8._cancel() : e.callParentHandler();
         };
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var _this9 = this;

         this._resetBackButtonHandler();

         contentReady(this, function () {
           _this9._margin = _this9._margin || parseInt(window.getComputedStyle(_this9).getPropertyValue('top'));
           _this9._radius = parseInt(window.getComputedStyle(_this9._content).getPropertyValue('border-top-left-radius'));

           _this9._mask.addEventListener('click', _this9._boundCancel, false);

           _this9._resetBackButtonHandler();

           window.addEventListener('resize', _this9._boundOnChange, false);
         });
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         var _this10 = this;

         contentReady(this, function () {
           _this10._mask.removeEventListener('click', _this10._boundCancel, false);

           _this10._backButtonHandler.destroy();
           _this10._backButtonHandler = null;

           window.removeEventListener('resize', _this10._boundOnChange, false);
         });
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$14);
         }
         if (name === 'direction') {
           return this._boundOnChange();
         }
         if (name === 'animation') {
           this._initAnimatorFactory();
         }
       }
     }, {
       key: '_cancel',
       value: function _cancel() {
         var _this11 = this;

         if (this.cancelable) {
           this.hide({
             callback: function callback() {
               util.triggerElementEvent(_this11, 'dialog-cancel');
             }
           });
         }
       }
     }, {
       key: '_mask',

       get: function get() {
         return util.findChild(this, '.popover-mask');
       }
     }, {
       key: '_popover',
       get: function get() {
         return util.findChild(this, '.popover__container');
       }
     }, {
       key: '_content',
       get: function get() {
         return util.findChild(this._popover, '.popover__content');
       }
     }, {
       key: '_arrow',
       get: function get() {
         return util.findChild(this._popover, '.popover__arrow');
       }
     }, {
       key: 'visible',
       get: function get() {
         return window.getComputedStyle(this).getPropertyValue('display') !== 'none';
       }
     }, {
       key: 'cancelable',
       set: function set(value) {
         return util.toggleAttribute(this, 'cancelable', value);
       },
       get: function get() {
         return this.hasAttribute('cancelable');
       }
     }, {
       key: 'onDeviceBackButton',
       get: function get() {
         return this._backButtonHandler;
       },
       set: function set(callback) {
         if (this._backButtonHandler) {
           this._backButtonHandler.destroy();
         }

         this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
       }
     }], [{
       key: 'registerAnimator',
       value: function registerAnimator(name, Animator) {
         if (!(Animator.prototype instanceof PopoverAnimator)) {
           throw new Error('"Animator" param must inherit PopoverAnimator');
         }
         _animatorDict$4[name] = Animator;
       }
     }, {
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'direction', 'animation'];
       }
     }, {
       key: 'PopoverAnimator',
       get: function get() {
         return PopoverAnimator;
       }
     }]);
     return PopoverElement;
   }(BaseElement);

   customElements.define('ons-popover', PopoverElement);

   var scheme$15 = {
     '.progress-bar': 'progress-bar--*',
     '.progress-bar__primary': 'progress-bar__primary--*',
     '.progress-bar__secondary': 'progress-bar__secondary--*'
   };

   var template = util.createElement('<div class="progress-bar"><div class="progress-bar__secondary"></div>' +
    '<div class="progress-bar__primary"></div></div>');

   var ProgressBarElement = function (_BaseElement) {
     babelHelpers.inherits(ProgressBarElement, _BaseElement);

     function ProgressBarElement() {
       babelHelpers.classCallCheck(this, ProgressBarElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ProgressBarElement).apply(this, arguments));
     }

     babelHelpers.createClass(ProgressBarElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           return _this2._compile();
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         if (!this._isCompiled()) {
           this._template = template.cloneNode(true);
         } else {
           this._template = util.findChild(this, '.progress-bar');
         }

         this._primary = util.findChild(this._template, '.progress-bar__primary');
         this._secondary = util.findChild(this._template, '.progress-bar__secondary');

         this._updateDeterminate();
         this._updateValue();

         this.appendChild(this._template);

         ModifierUtil.initModifier(this, scheme$15);
       }
     }, {
       key: '_isCompiled',
       value: function _isCompiled() {
         if (!util.findChild(this, '.progress-bar')) {
           return false;
         }

         var barElement = util.findChild(this, '.progress-bar');

         if (!util.findChild(barElement, '.progress-bar__secondary')) {
           return false;
         }

         if (!util.findChild(barElement, '.progress-bar__primary')) {
           return false;
         }

         return true;
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$15);
         } else if (name === 'value' || name === 'secondary-value') {
           this._updateValue();
         } else if (name === 'indeterminate') {
           this._updateDeterminate();
         }
       }
     }, {
       key: '_updateDeterminate',
       value: function _updateDeterminate() {
         var _this3 = this;

         if (this.hasAttribute('indeterminate')) {
           contentReady(this, function () {
             _this3._template.classList.add('progress-bar--indeterminate');
             _this3._template.classList.remove('progress-bar--determinate');
           });
         } else {
           contentReady(this, function () {
             _this3._template.classList.add('progress-bar--determinate');
             _this3._template.classList.remove('progress-bar--indeterminate');
           });
         }
       }
     }, {
       key: '_updateValue',
       value: function _updateValue() {
         var _this4 = this;

         contentReady(this, function () {
           _this4._primary.style.width = _this4.hasAttribute('value') ? _this4.getAttribute('value') + '%' : '0%';
           _this4._secondary.style.width = _this4.hasAttribute('secondary-value') ? 
              _this4.getAttribute('secondary-value') + '%' : '0%';
         });
       }
     }, {
       key: 'value',
       set: function set(value) {
         if (typeof value !== 'number' || value < 0 || value > 100) {
           throw new Error('Invalid value');
         }

         this.setAttribute('value', Math.floor(value));
       },
       get: function get() {
         return parseInt(this.getAttribute('value') || '0');
       }
     }, {
       key: 'secondaryValue',
       set: function set(value) {
         if (typeof value !== 'number' || value < 0 || value > 100) {
           throw new Error('Invalid value');
         }

         this.setAttribute('secondary-value', Math.floor(value));
       },
       get: function get() {
         return parseInt(this.getAttribute('secondary-value') || '0');
       }
     }, {
       key: 'indeterminate',
       set: function set(value) {
         if (value) {
           this.setAttribute('indeterminate', '');
         } else {
           this.removeAttribute('indeterminate');
         }
       },
       get: function get() {
         return this.hasAttribute('indeterminate');
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'value', 'secondary-value', 'indeterminate'];
       }
     }]);
     return ProgressBarElement;
   }(BaseElement);

   customElements.define('ons-progress-bar', ProgressBarElement);

   var scheme$16 = {
     '.progress-circular': 'progress-circular--*',
     '.progress-circular__primary': 'progress-circular__primary--*',
     '.progress-circular__secondary': 'progress-circular__secondary--*'
   };

   var template$1 = util.createElement('<svg class="progress-circular">' +
    '<circle class="progress-circular__secondary" cx="50%" cy="50%" r="40%" fill="none" stroke-width="10%" stroke-miterlimit="10"/>' +
    '<circle class="progress-circular__primary" cx="50%" cy="50%" r="40%" fill="none" stroke-width="10%" stroke-miterlimit="10"/>' +
    '</svg>');

   var ProgressCircularElement = function (_BaseElement) {
     babelHelpers.inherits(ProgressCircularElement, _BaseElement);

     function ProgressCircularElement() {
       babelHelpers.classCallCheck(this, ProgressCircularElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ProgressCircularElement).apply(this, arguments));
     }

     babelHelpers.createClass(ProgressCircularElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           return _this2._compile();
         });
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$16);
         } else if (name === 'value' || name === 'secondary-value') {
           this._updateValue();
         } else if (name === 'indeterminate') {
           this._updateDeterminate();
         }
       }
     }, {
       key: '_updateDeterminate',
       value: function _updateDeterminate() {
         var _this3 = this;

         if (this.hasAttribute('indeterminate')) {
           contentReady(this, function () {
             _this3._template.classList.add('progress-circular--indeterminate');
             _this3._template.classList.remove('progress-circular--determinate');
           });
         } else {
           contentReady(this, function () {
             _this3._template.classList.add('progress-circular--determinate');
             _this3._template.classList.remove('progress-circular--indeterminate');
           });
         }
       }
     }, {
       key: '_updateValue',
       value: function _updateValue() {
         var _this4 = this;

         if (this.hasAttribute('value')) {
           contentReady(this, function () {
             var per = Math.ceil(_this4.getAttribute('value') * 251.32 * 0.01);
             _this4._primary.style['stroke-dasharray'] = per + '%, 251.32%';
           });
         }
         if (this.hasAttribute('secondary-value')) {
           contentReady(this, function () {
             var per = Math.ceil(_this4.getAttribute('secondary-value') * 251.32 * 0.01);
             _this4._secondary.style['stroke-dasharray'] = per + '%, 251.32%';
           });
         }
       }
     }, {
       key: '_compile',
       value: function _compile() {
         if (this._isCompiled()) {
           this._template = util.findChild(this, '.progress-circular');
         } else {
           this._template = template$1.cloneNode(true);
         }

         this._primary = util.findChild(this._template, '.progress-circular__primary');
         this._secondary = util.findChild(this._template, '.progress-circular__secondary');

         this._updateDeterminate();
         this._updateValue();

         this.appendChild(this._template);

         ModifierUtil.initModifier(this, scheme$16);
       }
     }, {
       key: '_isCompiled',
       value: function _isCompiled() {
         if (!util.findChild(this, '.progress-circular')) {
           return false;
         }

         var svg = util.findChild(this, '.progress-circular');

         if (!util.findChild(svg, '.progress-circular__secondary')) {
           return false;
         }

         if (!util.findChild(svg, '.progress-circular__primary')) {
           return false;
         }

         return true;
       }
     }, {
       key: 'value',
       set: function set(value) {
         if (typeof value !== 'number' || value < 0 || value > 100) {
           throw new Error('Invalid value');
         }

         this.setAttribute('value', Math.floor(value));
       },
       get: function get() {
         return parseInt(this.getAttribute('value') || '0');
       }
     }, {
       key: 'secondaryValue',
       set: function set(value) {
         if (typeof value !== 'number' || value < 0 || value > 100) {
           throw new Error('Invalid value');
         }

         this.setAttribute('secondary-value', Math.floor(value));
       },
       get: function get() {
         return parseInt(this.getAttribute('secondary-value') || '0');
       }
     }, {
       key: 'indeterminate',
       set: function set(value) {
         if (value) {
           this.setAttribute('indeterminate', '');
         } else {
           this.removeAttribute('indeterminate');
         }
       },
       get: function get() {
         return this.hasAttribute('indeterminate');
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'value', 'secondary-value', 'indeterminate'];
       }
     }]);
     return ProgressCircularElement;
   }(BaseElement);

   customElements.define('ons-progress-circular', ProgressCircularElement);

   var STATE_INITIAL = 'initial';
   var STATE_PREACTION = 'preaction';
   var STATE_ACTION = 'action';

   var removeTransform = function removeTransform(el) {
     el.style.transform = '';
     el.style.WebkitTransform = '';
     el.style.transition = '';
     el.style.WebkitTransition = '';
   };

   var PullHookElement = function (_BaseElement) {
     babelHelpers.inherits(PullHookElement, _BaseElement);

     function PullHookElement() {
       babelHelpers.classCallCheck(this, PullHookElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(PullHookElement).apply(this, arguments));
     }

     babelHelpers.createClass(PullHookElement, [{
       key: 'init',

       value: function init() {
         this._boundOnDrag = this._onDrag.bind(this);
         this._boundOnDragStart = this._onDragStart.bind(this);
         this._boundOnDragEnd = this._onDragEnd.bind(this);
         this._boundOnScroll = this._onScroll.bind(this);

         this._setState(STATE_INITIAL, true);
       }
     }, {
       key: '_setStyle',
       value: function _setStyle() {
         var height = this.height;

         this.style.height = height + 'px';
         this.style.lineHeight = height + 'px';
         this.style.marginTop = '-1px';
         this._pageElement.style.marginTop = '-' + height + 'px';
       }
     }, {
       key: '_onScroll',
       value: function _onScroll(event) {
         var element = this._pageElement;

         if (element.scrollTop < 0) {
           element.scrollTop = 0;
         }
       }
     }, {
       key: '_generateTranslationTransform',
       value: function _generateTranslationTransform(scroll) {
         return 'translate3d(0px, ' + scroll + 'px, 0px)';
       }
     }, {
       key: '_onDrag',
       value: function _onDrag(event) {
         var _this2 = this;

         if (this.disabled) {
           return;
         }

         if (platform.isAndroid()) {
           var element = this._pageElement;
           element.scrollTop = this._startScroll - event.gesture.deltaY;
           if (element.scrollTop < window.innerHeight && event.gesture.direction !== 'up') {
             event.gesture.preventDefault();
           }
         }

         if (this._currentTranslation === 0 && this._getCurrentScroll() === 0) {
           this._transitionDragLength = event.gesture.deltaY;

           var direction = event.gesture.interimDirection;
           if (direction === 'down') {
             this._transitionDragLength -= 1;
           } else {
             this._transitionDragLength += 1;
           }
         }

         var scroll = Math.max(event.gesture.deltaY - this._startScroll, 0);

         if (this._thresholdHeightEnabled() && scroll >= this.thresholdHeight) {
           event.gesture.stopDetect();

           setImmediate(function () {
             return _this2._finish();
           });
         } else if (scroll >= this.height) {
           this._setState(STATE_PREACTION);
         } else {
           this._setState(STATE_INITIAL);
         }

         event.stopPropagation();
         this._translateTo(scroll);
       }
     }, {
       key: '_onDragStart',
       value: function _onDragStart(event) {
         if (this.disabled) {
           return;
         }

         this._startScroll = this._getCurrentScroll();
       }
     }, {
       key: '_onDragEnd',
       value: function _onDragEnd(event) {
         if (this.disabled) {
           return;
         }

         if (this._currentTranslation > 0) {
           var scroll = this._currentTranslation;

           if (scroll > this.height) {
             this._finish();
           } else {
             this._translateTo(0, { animate: true });
           }
         }
       }
     }, {
       key: '_finish',
       value: function _finish() {
         var _this3 = this;

         this._setState(STATE_ACTION);
         this._translateTo(this.height, { animate: true });
         var action = this.onAction || function (done) {
           return done();
         };
         action(function () {
           _this3._translateTo(0, { animate: true });
           _this3._setState(STATE_INITIAL);
         });
       }
     }, {
       key: '_thresholdHeightEnabled',
       value: function _thresholdHeightEnabled() {
         var th = this.thresholdHeight;
         return th > 0 && th >= this.height;
       }
     }, {
       key: '_setState',
       value: function _setState(state, noEvent) {
         var lastState = this._getState();

         this.setAttribute('state', state);

         if (!noEvent && lastState !== this._getState()) {
           util.triggerElementEvent(this, 'changestate', {
             pullHook: this,
             state: state,
             lastState: lastState
           });
         }
       }
     }, {
       key: '_getState',
       value: function _getState() {
         return this.getAttribute('state');
       }
     }, {
       key: '_getCurrentScroll',
       value: function _getCurrentScroll() {
         return this._pageElement.scrollTop;
       }
     }, {
       key: '_isContentFixed',
       value: function _isContentFixed() {
         return this.hasAttribute('fixed-content');
       }
     }, {
       key: '_getScrollableElement',
       value: function _getScrollableElement() {
         if (this._isContentFixed()) {
           return this;
         } else {
           return this._pageElement;
         }
       }
     }, {
       key: '_translateTo',
       value: function _translateTo(scroll) {
         var _this4 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         if (this._currentTranslation == 0 && scroll == 0) {
           return;
         }

         var done = function done() {
           if (scroll === 0) {
             var el = _this4._getScrollableElement();
             removeTransform(el);
           }

           if (options.callback) {
             options.callback();
           }
         };

         this._currentTranslation = scroll;

         if (options.animate) {
           animit(this._getScrollableElement()).queue({
             transform: this._generateTranslationTransform(scroll)
           }, {
             duration: 0.3,
             timing: 'cubic-bezier(.1, .7, .1, 1)'
           }).play(done);
         } else {
           animit(this._getScrollableElement()).queue({
             transform: this._generateTranslationTransform(scroll)
           }).play(done);
         }
       }
     }, {
       key: '_disableDragLock',
       value: function _disableDragLock() {
         this._dragLockDisabled = true;
         this._destroyEventListeners();
         this._createEventListeners();
       }
     }, {
       key: '_createEventListeners',
       value: function _createEventListeners() {
         this._gestureDetector = new GestureDetector(this._pageElement, {
           dragMinDistance: 1,
           dragDistanceCorrection: false,
           dragLockToAxis: !this._dragLockDisabled
         });

         this._gestureDetector.on('dragup dragdown', this._boundOnDrag);
         this._gestureDetector.on('dragstart', this._boundOnDragStart);
         this._gestureDetector.on('dragend', this._boundOnDragEnd);

         this._pageElement.addEventListener('scroll', this._boundOnScroll, false);
       }
     }, {
       key: '_destroyEventListeners',
       value: function _destroyEventListeners() {
         if (this._gestureDetector) {
           this._gestureDetector.off('dragup dragdown', this._boundOnDrag);
           this._gestureDetector.off('dragstart', this._boundOnDragStart);
           this._gestureDetector.off('dragend', this._boundOnDragEnd);

           this._gestureDetector.dispose();
           this._gestureDetector = null;
         }

         this._pageElement.removeEventListener('scroll', this._boundOnScroll, false);
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this._currentTranslation = 0;
         this._pageElement = this.parentNode;

         this._createEventListeners();
         this._setStyle();
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this._pageElement.style.marginTop = '';

         this._destroyEventListeners();
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'height') {
           this._setStyle();
         }
       }
     }, {
       key: 'height',
       set: function set(value) {
         if (!util.isInteger(value)) {
           throw new Error('The height must be an integer');
         }

         this.setAttribute('height', value + 'px');
       },
       get: function get() {
         return parseInt(this.getAttribute('height') || '64', 10);
       }
     }, {
       key: 'thresholdHeight',
       set: function set(value) {
         if (!util.isInteger(value)) {
           throw new Error('The threshold height must be an integer');
         }

         this.setAttribute('threshold-height', value + 'px');
       },
       get: function get() {
         return parseInt(this.getAttribute('threshold-height') || '96', 10);
       }
     }, {
       key: 'state',
       get: function get() {
         return this._getState();
       }
     }, {
       key: 'pullDistance',
       get: function get() {
         return this._currentTranslation;
       }
     }, {
       key: 'disabled',
       set: function set(value) {
         return util.toggleAttribute(this, 'disabled', value);
       },
       get: function get() {
         return this.hasAttribute('disabled');
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['height'];
       }
     }, {
       key: 'STATE_INITIAL',
       get: function get() {
         return STATE_INITIAL;
       }
     }, {
       key: 'STATE_PREACTION',
       get: function get() {
         return STATE_PREACTION;
       }
     }, {
       key: 'STATE_ACTION',
       get: function get() {
         return STATE_ACTION;
       }
     }]);
     return PullHookElement;
   }(BaseElement);

   customElements.define('ons-pull-hook', PullHookElement);

   var AnimatorCSS = function () {
     babelHelpers.createClass(AnimatorCSS, [{
       key: 'animate',

       value: function animate(el, final) {
         var duration = arguments.length <= 2 || arguments[2] === undefined ? 200 : arguments[2];

         var start = new Date().getTime(),
             initial = {},
             stopped = false,
             next = false,
             timeout = false,
             properties = Object.keys(final);

         var updateStyles = function updateStyles() {
           var s = window.getComputedStyle(el);
           properties.forEach(s.getPropertyValue.bind(s));
           s = el.offsetHeight;
         };

         var result = {
           stop: function stop() {
             var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

             timeout && clearTimeout(timeout);
             var k = Math.min(1, (new Date().getTime() - start) / duration);
             properties.forEach(function (i) {
               el.style[i] = (1 - k) * initial[i] + k * final[i] + (i == 'opacity' ? '' : 'px');
             });
             el.style.transitionDuration = '0s';

             if (options.stopNext) {
               next = false;
             } else if (!stopped) {
               stopped = true;
               next && next();
             }
             return result;
           },
           then: function then(cb) {
             next = cb;
             if (stopped) {
               next && next();
             }
             return result;
           },
           speed: function speed(newDuration) {
             if (internal.config.animationsDisabled) {
               newDuration = 0;
             }
             if (!stopped) {
               (function () {
                 timeout && clearTimeout(timeout);

                 var passed = new Date().getTime() - start;
                 var k = passed / duration;
                 var remaining = newDuration * (1 - k);

                 properties.forEach(function (i) {
                   el.style[i] = (1 - k) * initial[i] + k * final[i] + (i == 'opacity' ? '' : 'px');
                 });

                 updateStyles();

                 start = el.speedUpTime;
                 duration = remaining;

                 el.style.transitionDuration = duration / 1000 + 's';

                 properties.forEach(function (i) {
                   el.style[i] = final[i] + (i == 'opacity' ? '' : 'px');
                 });

                 timeout = setTimeout(result.stop, remaining);
               })();
             }
             return result;
           },
           finish: function finish() {
             var milliseconds = arguments.length <= 0 || arguments[0] === undefined ? 50 : arguments[0];

             var k = (new Date().getTime() - start) / duration;

             result.speed(milliseconds / (1 - k));
             return result;
           }
         };

         if (el.hasAttribute('disabled') || stopped || internal.config.animationsDisabled) {
           return result;
         }

         var style = window.getComputedStyle(el);
         properties.forEach(function (e) {
           var v = parseFloat(style.getPropertyValue(e));
           initial[e] = isNaN(v) ? 0 : v;
         });

         if (!stopped) {
           el.style.transitionProperty = properties.join(',');
           el.style.transitionDuration = duration / 1000 + 's';

           properties.forEach(function (e) {
             el.style[e] = final[e] + (e == 'opacity' ? '' : 'px');
           });
         }

         timeout = setTimeout(result.stop, duration);
         this._onStopAnimations(el, result.stop);

         return result;
       }
     }]);

     function AnimatorCSS() {
       babelHelpers.classCallCheck(this, AnimatorCSS);

       this._queue = [];
       this._index = 0;
     }

     babelHelpers.createClass(AnimatorCSS, [{
       key: '_onStopAnimations',
       value: function _onStopAnimations(el, listener) {
         var queue = this._queue;
         var i = this._index++;
         queue[el] = queue[el] || [];
         queue[el][i] = function (options) {
           delete queue[el][i];
           if (queue[el] && queue[el].length == 0) {
             delete queue[el];
           }
           return listener(options);
         };
       }
     }, {
       key: 'stopAnimations',
       value: function stopAnimations(el) {
         var _this = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         if (Array.isArray(el)) {
           return el.forEach(function (el) {
             _this.stopAnimations(el, options);
           });
         }

         (this._queue[el] || []).forEach(function (e) {
           e(options || {});
         });
       }
     }, {
       key: 'stopAll',
       value: function stopAll() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         this.stopAnimations(Object.keys(this._queue), options);
       }
     }, {
       key: 'fade',
       value: function fade(el) {
         var duration = arguments.length <= 1 || arguments[1] === undefined ? 200 : arguments[1];

         return this.animate(el, { opacity: 0 }, duration);
       }
     }]);
     return AnimatorCSS;
   }();

   var RippleElement = function (_BaseElement) {
     babelHelpers.inherits(RippleElement, _BaseElement);

     function RippleElement() {
       babelHelpers.classCallCheck(this, RippleElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(RippleElement).apply(this, arguments));
     }

     babelHelpers.createClass(RippleElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           return _this2._compile();
         });

         this._animator = new AnimatorCSS();

         ['color', 'center', 'start-radius', 'background'].forEach(function (e) {
           _this2.attributeChangedCallback(e, null, _this2.getAttribute(e));
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         this.classList.add('ripple');

         this._wave = this.getElementsByClassName('ripple__wave')[0];
         this._background = this.getElementsByClassName('ripple__background')[0];

         if (!(this._background && this._wave)) {
           this._wave = util.create('.ripple__wave');
           this._background = util.create('.ripple__background');

           this.appendChild(this._wave);
           this.appendChild(this._background);
         }
       }
     }, {
       key: '_calculateCoords',
       value: function _calculateCoords(e) {
         var x, y, h, w, r;
         var b = this.getBoundingClientRect();
         if (this._center) {
           x = b.width / 2;
           y = b.height / 2;
           r = Math.sqrt(x * x + y * y);
         } else {
           x = (e.clientX || e.changedTouches[0].clientX) - b.left;
           y = (e.clientY || e.changedTouches[0].clientY) - b.top;
           h = Math.max(y, b.height - y);
           w = Math.max(x, b.width - x);
           r = Math.sqrt(h * h + w * w);
         }
         return { x: x, y: y, r: r };
       }
     }, {
       key: '_rippleAnimation',
       value: function _rippleAnimation(e) {
         var duration = arguments.length <= 1 || arguments[1] === undefined ? 300 : arguments[1];
         var _animator = this._animator;
         var _wave = this._wave;
         var _background = this._background;

         var _minR = this._minR;

         var _calculateCoords2 = this._calculateCoords(e);

         var x = _calculateCoords2.x;
         var y = _calculateCoords2.y;
         var r = _calculateCoords2.r;

         _animator.stopAll({ stopNext: 1 });
         _animator.animate(_background, { opacity: 1 }, duration);

         util.extend(_wave.style, {
           opacity: 1,
           top: y - _minR + 'px',
           left: x - _minR + 'px',
           width: 2 * _minR + 'px',
           height: 2 * _minR + 'px'
         });

         return _animator.animate(_wave, {
           top: y - r,
           left: x - r,
           height: 2 * r,
           width: 2 * r
         }, duration);
       }
     }, {
       key: '_updateParent',
       value: function _updateParent() {
         if (!this._parentUpdated && this.parentNode) {
           var computedStyle = window.getComputedStyle(this.parentNode);
           if (computedStyle.getPropertyValue('position') === 'static') {
             this.parentNode.style.position = 'relative';
           }
           this._parentUpdated = true;
         }
       }
     }, {
       key: '_onTap',
       value: function _onTap(e) {
         var _this3 = this;

         if (!this.disabled) {
           this._updateParent();
           this._rippleAnimation(e.gesture.srcEvent).then(function () {
             _this3._animator.fade(_this3._wave);
             _this3._animator.fade(_this3._background);
           });
         }
       }
     }, {
       key: '_onHold',
       value: function _onHold(e) {
         if (!this.disabled) {
           this._updateParent();
           this._holding = this._rippleAnimation(e.gesture.srcEvent, 2000);
           document.addEventListener('release', this._boundOnRelease);
         }
       }
     }, {
       key: '_onRelease',
       value: function _onRelease(e) {
         var _this4 = this;

         if (this._holding) {
           this._holding.speed(300).then(function () {
             _this4._animator.stopAll({ stopNext: true });
             _this4._animator.fade(_this4._wave);
             _this4._animator.fade(_this4._background);
           });

           this._holding = false;
         }

         document.removeEventListener('release', this._boundOnRelease);
       }
     }, {
       key: '_onDragStart',
       value: function _onDragStart(e) {
         if (this._holding) {
           return this._onRelease(e);
         }
         if (['left', 'right'].indexOf(e.gesture.direction) != -1) {
           this._onTap(e);
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this._parentNode = this.parentNode;
         this._boundOnTap = this._onTap.bind(this);
         this._boundOnHold = this._onHold.bind(this);
         this._boundOnDragStart = this._onDragStart.bind(this);
         this._boundOnRelease = this._onRelease.bind(this);

         if (internal.config.animationsDisabled) {
           this.disabled = true;
         } else {
           this._parentNode.addEventListener('tap', this._boundOnTap);
           this._parentNode.addEventListener('hold', this._boundOnHold);
           this._parentNode.addEventListener('dragstart', this._boundOnDragStart);
         }
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         var pn = this._parentNode || this.parentNode;
         pn.removeEventListener('tap', this._boundOnTap);
         pn.removeEventListener('hold', this._boundOnHold);
         pn.removeEventListener('dragstart', this._boundOnDragStart);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         var _this5 = this;

         if (name === 'start-radius') {
           this._minR = Math.max(0, parseFloat(current) || 0);
         }
         if (name === 'color' && current) {
           contentReady(this, function () {
             _this5._wave.style.background = current;
             if (!_this5.hasAttribute('background')) {
               _this5._background.style.background = current;
             }
           });
         }
         if (name === 'background' && (current || last)) {
           if (current === 'none') {
             contentReady(this, function () {
               _this5._background.setAttribute('disabled', 'disabled');
               _this5._background.style.background = 'transparent';
             });
           } else {
             contentReady(this, function () {
               if (_this5._background.hasAttribute('disabled')) {
                 _this5._background.removeAttribute('disabled');
               }
               _this5._background.style.background = current;
             });
           }
         }
         if (name === 'center') {
           this._center = current != null && current != 'false';
         }
       }
     }, {
       key: 'disabled',
       set: function set(value) {
         return util.toggleAttribute(this, 'disabled', value);
       },
       get: function get() {
         return this.hasAttribute('disabled');
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['start-radius', 'color', 'background', 'center'];
       }
     }]);
     return RippleElement;
   }(BaseElement);

   customElements.define('ons-ripple', RippleElement);

   var RowElement = function (_BaseElement) {
     babelHelpers.inherits(RowElement, _BaseElement);

     function RowElement() {
       babelHelpers.classCallCheck(this, RowElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(RowElement).apply(this, arguments));
     }

     return RowElement;
   }(BaseElement);

   customElements.define('ons-row', RowElement);

   var scheme$17 = {
     '': 'speed-dial__item--*'
   };

   var SpeedDialItemElement = function (_BaseElement) {
     babelHelpers.inherits(SpeedDialItemElement, _BaseElement);

     function SpeedDialItemElement() {
       babelHelpers.classCallCheck(this, SpeedDialItemElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SpeedDialItemElement).apply(this, arguments));
     }

     babelHelpers.createClass(SpeedDialItemElement, [{
       key: 'init',

       value: function init() {
         this._compile();
         this._boundOnClick = this._onClick.bind(this);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         switch (name) {
           case 'modifier':
             ModifierUtil.onModifierChanged(last, current, this, scheme$17);
             break;
           case 'ripple':
             this._updateRipple();
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this.addEventListener('click', this._boundOnClick, false);
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this.removeEventListener('click', this._boundOnClick, false);
       }
     }, {
       key: '_updateRipple',
       value: function _updateRipple() {
         util.updateRipple(this);
       }
     }, {
       key: '_onClick',
       value: function _onClick(e) {
         e.stopPropagation();
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         this.classList.add('fab');
         this.classList.add('fab--mini');
         this.classList.add('speed-dial__item');

         this._updateRipple();

         ModifierUtil.initModifier(this, scheme$17);
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'ripple'];
       }
     }]);
     return SpeedDialItemElement;
   }(BaseElement);

   customElements.define('ons-speed-dial-item', SpeedDialItemElement);

   var styler = function styler(element, style) {
     return styler.css.apply(styler, arguments);
   };

   styler.css = function (element, styles) {
     var keys = Object.keys(styles);
     keys.forEach(function (key) {
       if (key in element.style) {
         element.style[key] = styles[key];
       } else if (styler._prefix(key) in element.style) {
         element.style[styler._prefix(key)] = styles[key];
       } else {
         console.warn('No such style property: ' + key);
       }
     });
     return element;
   };

   styler._prefix = function () {
     var styles = window.getComputedStyle(document.documentElement, '');
     var prefix = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];

     return function (name) {
       return prefix + name.substr(0, 1).toUpperCase() + name.substr(1);
     };
   }();

   styler.clear = function (element) {
     styler._clear(element);
   };

   styler._clear = function (element) {
     var len = element.style.length;
     var style = element.style;
     var keys = [];
     for (var i = 0; i < len; i++) {
       keys.push(style[i]);
     }

     keys.forEach(function (key) {
       style[key] = '';
     });
   };

   var scheme$18 = {
     '': 'speed-dial--*'
   };

   var SpeedDialElement = function (_BaseElement) {
     babelHelpers.inherits(SpeedDialElement, _BaseElement);

     function SpeedDialElement() {
       babelHelpers.classCallCheck(this, SpeedDialElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SpeedDialElement).apply(this, arguments));
     }

     babelHelpers.createClass(SpeedDialElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           _this2._compile();
         });

         this._shown = true;
         this._itemShown = false;
         this._boundOnClick = this._onClick.bind(this);
       }
     }, {
       key: '_compile',
       value: function _compile() {
         if (!this.classList.contains('speed__dial')) {
           this.classList.add('speed__dial');
           autoStyle.prepare(this);
           this._updateRipple();
           ModifierUtil.initModifier(this, scheme$18);

           if (this.hasAttribute('direction')) {
             this._updateDirection(this.getAttribute('direction'));
           } else {
             this._updateDirection('up');
           }
         }

         this._updatePosition();
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         var _this3 = this;

         switch (name) {
           case 'modifier':
             ModifierUtil.onModifierChanged(last, current, this, scheme$18);
             break;
           case 'ripple':
             contentReady(this, function () {
               return _this3._updateRipple();
             });
             break;
           case 'direction':
             contentReady(this, function () {
               return _this3._updateDirection(current);
             });
             break;
           case 'position':
             contentReady(this, function () {
               return _this3._updatePosition();
             });
             break;
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this.addEventListener('click', this._boundOnClick, false);
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this.removeEventListener('click', this._boundOnClick, false);
       }
     }, {
       key: '_onClick',
       value: function _onClick(e) {
         if (!this.disabled && this._shown) {
           this.toggleItems();
         }
       }
     }, {
       key: '_show',
       value: function _show() {
         if (!this.inline) {
           this.show();
         }
       }
     }, {
       key: '_hide',
       value: function _hide() {
         if (!this.inline) {
           this.hide();
         }
       }
     }, {
       key: '_updateRipple',
       value: function _updateRipple() {
         var fab = util.findChild(this, 'ons-fab');

         if (fab) {
           this.hasAttribute('ripple') ? fab.setAttribute('ripple', '') : fab.removeAttribute('ripple');
         }
       }
     }, {
       key: '_updateDirection',
       value: function _updateDirection(direction) {
         var children = this.items;
         for (var i = 0; i < children.length; i++) {
           styler(children[i], {
             transitionDelay: 25 * i + 'ms',
             bottom: 'auto',
             right: 'auto',
             top: 'auto',
             left: 'auto'
           });
         }
         switch (direction) {
           case 'up':
             for (var _i = 0; _i < children.length; _i++) {
               children[_i].style.bottom = 72 + 56 * _i + 'px';
               children[_i].style.right = '8px';
             }
             break;
           case 'down':
             for (var _i2 = 0; _i2 < children.length; _i2++) {
               children[_i2].style.top = 72 + 56 * _i2 + 'px';
               children[_i2].style.left = '8px';
             }
             break;
           case 'left':
             for (var _i3 = 0; _i3 < children.length; _i3++) {
               children[_i3].style.top = '8px';
               children[_i3].style.right = 72 + 56 * _i3 + 'px';
             }
             break;
           case 'right':
             for (var _i4 = 0; _i4 < children.length; _i4++) {
               children[_i4].style.top = '8px';
               children[_i4].style.left = 72 + 56 * _i4 + 'px';
             }
             break;
           default:
             throw new Error('Argument must be one of up, down, left or right.');
         }
       }
     }, {
       key: '_updatePosition',
       value: function _updatePosition() {
         var position = this.getAttribute('position');
         this.classList.remove('fab--top__left', 'fab--bottom__right', 'fab--bottom__left', 'fab--top__right', 
          'fab--top__center', 'fab--bottom__center');
         switch (position) {
           case 'top right':
           case 'right top':
             this.classList.add('fab--top__right');
             break;
           case 'top left':
           case 'left top':
             this.classList.add('fab--top__left');
             break;
           case 'bottom right':
           case 'right bottom':
             this.classList.add('fab--bottom__right');
             break;
           case 'bottom left':
           case 'left bottom':
             this.classList.add('fab--bottom__left');
             break;
           case 'center top':
           case 'top center':
             this.classList.add('fab--top__center');
             break;
           case 'center bottom':
           case 'bottom center':
             this.classList.add('fab--bottom__center');
             break;
           default:
             break;
         }
       }
     }, {
       key: 'show',
       value: function show() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         this.querySelector('ons-fab').show();
         this._shown = true;
       }
     }, {
       key: 'hide',
       value: function hide() {
         var _this4 = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         this.hideItems();
         setTimeout(function () {
           _this4.querySelector('ons-fab').hide();
         }, 200);
         this._shown = false;
       }
     }, {
       key: 'showItems',
       value: function showItems() {
         if (this.hasAttribute('direction')) {
           this._updateDirection(this.getAttribute('direction'));
         } else {
           this._updateDirection('up');
         }

         if (!this._itemShown) {
           var children = this.items;
           for (var i = 0; i < children.length; i++) {
             styler(children[i], {
               transform: 'scale(1)',
               transitionDelay: 25 * i + 'ms'
             });
           }
         }
         this._itemShown = true;

         util.triggerElementEvent(this, 'open');
       }
     }, {
       key: 'hideItems',
       value: function hideItems() {
         if (this._itemShown) {
           var children = this.items;
           for (var i = 0; i < children.length; i++) {
             styler(children[i], {
               transform: 'scale(0)',
               transitionDelay: 25 * (children.length - i) + 'ms'
             });
           }
         }
         this._itemShown = false;
         util.triggerElementEvent(this, 'close');
       }
     }, {
       key: 'isOpen',

       value: function isOpen() {
         return this._itemShown;
       }
     }, {
       key: 'toggle',
       value: function toggle() {
         this.visible ? this.hide() : this.show();
       }
     }, {
       key: 'toggleItems',
       value: function toggleItems() {
         if (this.isOpen()) {
           this.hideItems();
         } else {
           this.showItems();
         }
       }
     }, {
       key: 'items',
       get: function get() {
         return util.arrayFrom(this.querySelectorAll('ons-speed-dial-item'));
       }
     }, {
       key: 'disabled',
       set: function set(value) {
         if (value) {
           this.hideItems();
         }
         util.arrayFrom(this.children).forEach(function (e) {
           util.match(e, '.fab') && util.toggleAttribute(e, 'disabled', value);
         });

         return util.toggleAttribute(this, 'disabled', value);
       },
       get: function get() {
         return this.hasAttribute('disabled');
       }
     }, {
       key: 'inline',
       get: function get() {
         return this.hasAttribute('inline');
       }
     }, {
       key: 'visible',
       get: function get() {
         return this._shown && this.style.display !== 'none';
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'ripple', 'direction', 'position'];
       }
     }]);
     return SpeedDialElement;
   }(BaseElement);

   customElements.define('ons-speed-dial', SpeedDialElement);

   var rewritables$1 = {
     ready: function ready(element, callback) {
       setImmediate(callback);
     },

     link: function link(element, target, options, callback) {
       callback(target);
     }
   };

   var SplitterContentElement = function (_BaseElement) {
     babelHelpers.inherits(SplitterContentElement, _BaseElement);

     function SplitterContentElement() {
       babelHelpers.classCallCheck(this, SplitterContentElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SplitterContentElement).apply(this, arguments));
     }

     babelHelpers.createClass(SplitterContentElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         this._page = null;
         this._pageLoader = defaultPageLoader;

         contentReady(this, function () {
           var page = _this2._getPageTarget();

           if (page) {
             _this2.load(page);
           }
         });
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         if (!util.match(this.parentNode, 'ons-splitter')) {
           throw new Error('"ons-splitter-content" must have "ons-splitter" as parentNode.');
         }
       }
     }, {
       key: '_getPageTarget',
       value: function _getPageTarget() {
         return this._page || this.getAttribute('page');
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {}
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {}
     }, {
       key: 'load',

       value: function load(page) {
         var _this3 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         this._page = page;
         var callback = options.callback || function () {};

         return new Promise(function (resolve) {
           _this3._pageLoader.load({ page: page, parent: _this3, replace: true }, function (_ref) {
             var element = _ref.element;
             var unload = _ref.unload;

             rewritables$1.link(_this3, element, options, function (fragment) {
               setImmediate(function () {
                 return _this3._show();
               });
               callback();

               resolve(_this3.firstChild);
             });
           });
         });
       }
     }, {
       key: '_show',
       value: function _show() {
         util.propagateAction(this, '_show');
       }
     }, {
       key: '_hide',
       value: function _hide() {
         util.propagateAction(this, '_hide');
       }
     }, {
       key: '_destroy',
       value: function _destroy() {
         util.propagateAction(this, '_destroy');
         this.remove();
       }
     }, {
       key: 'page',
       get: function get() {
         return this._page;
       }

       ,
       set: function set(page) {
         this._page = page;
       }
     }, {
       key: 'pageLoader',
       get: function get() {
         return this._pageLoader;
       },
       set: function set(loader) {
         if (!(loader instanceof PageLoader)) {
           throw Error('First parameter must be an instance of PageLoader');
         }
         this._pageLoader = loader;
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return [];
       }
     }, {
       key: 'rewritables',
       get: function get() {
         return rewritables$1;
       }
     }]);
     return SplitterContentElement;
   }(BaseElement);

   customElements.define('ons-splitter-content', SplitterContentElement);

   var SplitterMaskElement = function (_BaseElement) {
     babelHelpers.inherits(SplitterMaskElement, _BaseElement);

     function SplitterMaskElement() {
       babelHelpers.classCallCheck(this, SplitterMaskElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SplitterMaskElement).apply(this, arguments));
     }

     babelHelpers.createClass(SplitterMaskElement, [{
       key: 'init',
       value: function init() {
         this._boundOnClick = this._onClick.bind(this);
       }
     }, {
       key: '_onClick',
       value: function _onClick(event) {
         if (util.match(this.parentNode, 'ons-splitter')) {
           this.parentNode._sides.forEach(function (side) {
             return side.close('left').catch(function () {});
           });
         }
         event.stopPropagation();
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {}
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this.addEventListener('click', this._boundOnClick);
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this.removeEventListener('click', this._boundOnClick);
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return [];
       }
     }]);
     return SplitterMaskElement;
   }(BaseElement);

   customElements.define('ons-splitter-mask', SplitterMaskElement);

   var SplitterAnimator = function () {
     function SplitterAnimator() {
       var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
       babelHelpers.classCallCheck(this, SplitterAnimator);

       this._options = {
         timing: 'cubic-bezier(.1, .7, .1, 1)',
         duration: '0.3',
         delay: '0'
       };
       this.updateOptions(options);
     }

     babelHelpers.createClass(SplitterAnimator, [{
       key: 'updateOptions',
       value: function updateOptions() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         util.extend(this._options, options);
         this._timing = this._options.timing;
         this._duration = this._options.duration;
         this._delay = this._options.delay;
       }
     }, {
       key: 'activate',
       value: function activate(sideElement) {
         var _this = this;

         var splitter = sideElement.parentNode;

         contentReady(splitter, function () {
           _this._side = sideElement;
           _this._content = splitter.content;
           _this._mask = splitter.mask;
         });
       }
     }, {
       key: 'inactivate',
       value: function inactivate() {
         this._content = this._side = this._mask = null;
       }
     }, {
       key: 'translate',
       value: function translate(distance) {
         animit(this._side).queue({
           transform: 'translate3d(' + (this.minus + distance) + 'px, 0px, 0px)'
         }).play();
       }
     }, {
       key: 'open',
       value: function open(done) {
         animit.runAll(animit(this._side).wait(this._delay).queue({
           transform: 'translate3d(' + this.minus + '100%, 0px, 0px)'
         }, {
           duration: this._duration,
           timing: this._timing
         }).queue(function (callback) {
           callback();
           done && done();
         }), animit(this._mask).wait(this._delay).queue({
           display: 'block'
         }).queue({
           opacity: '1'
         }, {
           duration: this._duration,
           timing: 'linear'
         }));
       }
     }, {
       key: 'close',
       value: function close(done) {
         var _this2 = this;

         animit.runAll(animit(this._side).wait(this._delay).queue({
           transform: 'translate3d(0px, 0px, 0px)'
         }, {
           duration: this._duration,
           timing: this._timing
         }).queue(function (callback) {
           _this2._side.style.webkitTransition = '';
           done && done();
           callback();
         }), animit(this._mask).wait(this._delay).queue({
           opacity: '0'
         }, {
           duration: this._duration,
           timing: 'linear'
         }).queue({
           display: 'none'
         }));
       }
     }, {
       key: 'minus',
       get: function get() {
         return this._side._side === 'right' ? '-' : '';
       }
     }]);
     return SplitterAnimator;
   }();

   var _animatorDict$5 = {
     default: SplitterAnimator,
     overlay: SplitterAnimator
   };

   var SplitterElement = function (_BaseElement) {
     babelHelpers.inherits(SplitterElement, _BaseElement);

     function SplitterElement() {
       babelHelpers.classCallCheck(this, SplitterElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SplitterElement).apply(this, arguments));
     }

     babelHelpers.createClass(SplitterElement, [{
       key: '_getSide',
       value: function _getSide(side) {
         var element = util.findChild(this, function (e) {
           return util.match(e, 'ons-splitter-side') && e.getAttribute('side') === side;
         });
         return element;
       }
     }, {
       key: '_onDeviceBackButton',
       value: function _onDeviceBackButton(event) {
         this._sides.some(function (s) {
           return s.isOpen ? s.close() : false;
         }) || event.callParentHandler();
       }
     }, {
       key: '_onModeChange',
       value: function _onModeChange(e) {
         var _this2 = this;

         if (e.target.parentNode) {
           contentReady(this, function () {
             _this2._layout();
           });
         }
       }
     }, {
       key: '_layout',
       value: function _layout() {
         var _this3 = this;

         this._sides.forEach(function (side) {
           _this3.content.style[side._side] = side.mode === 'split' ? side._width : 0;
         });
       }
     }, {
       key: 'init',
       value: function init() {
         var _this4 = this;

         this._boundOnModeChange = this._onModeChange.bind(this);

         contentReady(this, function () {
           _this4._compile();
           _this4._layout();
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         if (!this.mask) {
           this.appendChild(document.createElement('ons-splitter-mask'));
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this.onDeviceBackButton = this._onDeviceBackButton.bind(this);
         this.addEventListener('modechange', this._boundOnModeChange, false);
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this._backButtonHandler.destroy();
         this._backButtonHandler = null;
         this.removeEventListener('modechange', this._boundOnModeChange, false);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {}
     }, {
       key: '_show',
       value: function _show() {
         util.propagateAction(this, '_show');
       }
     }, {
       key: '_hide',
       value: function _hide() {
         util.propagateAction(this, '_hide');
       }
     }, {
       key: '_destroy',
       value: function _destroy() {
         util.propagateAction(this, '_destroy');
         this.remove();
       }
     }, {
       key: 'left',
       get: function get() {
         return this._getSide('left');
       }
     }, {
       key: 'right',
       get: function get() {
         return this._getSide('right');
       }
     }, {
       key: '_sides',
       get: function get() {
         return [this.left, this.right].filter(function (e) {
           return e;
         });
       }
     }, {
       key: 'content',
       get: function get() {
         return util.findChild(this, 'ons-splitter-content');
       }
     }, {
       key: 'mask',
       get: function get() {
         return util.findChild(this, 'ons-splitter-mask');
       }
     }, {
       key: 'onDeviceBackButton',
       get: function get() {
         return this._backButtonHandler;
       },
       set: function set(callback) {
         if (this._backButtonHandler) {
           this._backButtonHandler.destroy();
         }

         this._backButtonHandler = deviceBackButtonDispatcher.createHandler(this, callback);
       }
     }], [{
       key: 'registerAnimator',
       value: function registerAnimator(name, Animator) {
         if (!(Animator instanceof SplitterAnimator)) {
           throw new Error('Animator parameter must be an instance of SplitterAnimator.');
         }
         _animatorDict$5[name] = Animator;
       }
     }, {
       key: 'SplitterAnimator',
       get: function get() {
         return SplitterAnimator;
       }
     }, {
       key: 'animators',
       get: function get() {
         return _animatorDict$5;
       }
     }]);
     return SplitterElement;
   }(BaseElement);

   customElements.define('ons-splitter', SplitterElement);

   var SPLIT_MODE = 'split';
   var COLLAPSE_MODE = 'collapse';
   var CLOSED_STATE = 'closed';
   var OPEN_STATE = 'open';
   var CHANGING_STATE = 'changing';

   var WATCHED_ATTRIBUTES = ['animation', 'width', 'side', 'collapse', 'swipeable', 'swipe-target-width', 
    'animation-options', 'open-threshold'];

   var rewritables$2 = {
     ready: function ready(splitterSideElement, callback) {
       setImmediate(callback);
     },

     link: function link(splitterSideElement, target, options, callback) {
       callback(target);
     }
   };

   var CollapseDetection = function () {
     function CollapseDetection(element, target) {
       babelHelpers.classCallCheck(this, CollapseDetection);

       this._element = element;
       this._boundOnChange = this._onChange.bind(this);
       target && this.changeTarget(target);
     }

     babelHelpers.createClass(CollapseDetection, [{
       key: 'changeTarget',
       value: function changeTarget(target) {
         this.disable();
         this._target = target;
         if (target) {
           this._orientation = ['portrait', 'landscape'].indexOf(target) !== -1;
           this.activate();
         }
       }
     }, {
       key: '_match',
       value: function _match(value) {
         if (this._orientation) {
           return this._target === (value.isPortrait ? 'portrait' : 'landscape');
         }
         return value.matches;
       }
     }, {
       key: '_onChange',
       value: function _onChange(value) {
         this._element._updateMode(this._match(value) ? COLLAPSE_MODE : SPLIT_MODE);
       }
     }, {
       key: 'activate',
       value: function activate() {
         if (this._orientation) {
           orientation.on('change', this._boundOnChange);
           this._onChange({ isPortrait: orientation.isPortrait() });
         } else {
           this._queryResult = window.matchMedia(this._target);
           this._queryResult.addListener(this._boundOnChange);
           this._onChange(this._queryResult);
         }
       }
     }, {
       key: 'disable',
       value: function disable() {
         if (this._orientation) {
           orientation.off('change', this._boundOnChange);
         } else if (this._queryResult) {
           this._queryResult.removeListener(this._boundOnChange);
           this._queryResult = null;
         }
       }
     }]);
     return CollapseDetection;
   }();

   var widthToPx = function widthToPx(width, parent) {
     var value = parseInt(width, 10);
     var px = /px/.test(width);

     return px ? value : Math.round(parent.offsetWidth * value / 100);
   };

   var CollapseMode = function () {
     babelHelpers.createClass(CollapseMode, [{
       key: '_animator',
       get: function get() {
         return this._element._animator;
       }
     }]);

     function CollapseMode(element) {
       babelHelpers.classCallCheck(this, CollapseMode);

       this._active = false;
       this._state = CLOSED_STATE;
       this._element = element;
       this._lock = new DoorLock();
     }

     babelHelpers.createClass(CollapseMode, [{
       key: 'isOpen',
       value: function isOpen() {
         return this._active && this._state !== CLOSED_STATE;
       }
     }, {
       key: 'handleGesture',
       value: function handleGesture(e) {
         if (!this._active || this._lock.isLocked() || this._isOpenOtherSideMenu()) {
           return;
         }
         if (e.type === 'dragstart') {
           this._onDragStart(e);
         } else if (!this._ignoreDrag) {
           e.type === 'dragend' ? this._onDragEnd(e) : this._onDrag(e);
         }
       }
     }, {
       key: '_onDragStart',
       value: function _onDragStart(event) {
         var scrolling = !/left|right/.test(event.gesture.direction);
         var distance = this._element._side === 'left' ? 
          event.gesture.center.clientX : window.innerWidth - event.gesture.center.clientX;
         var area = this._element._swipeTargetWidth;
         var isOpen = this.isOpen();
         this._ignoreDrag = scrolling || area && distance > area && !isOpen;

         this._width = widthToPx(this._element._width, this._element.parentNode);
         this._startDistance = this._distance = isOpen ? this._width : 0;
       }
     }, {
       key: '_onDrag',
       value: function _onDrag(event) {
         event.gesture.preventDefault();
         var delta = this._element._side === 'left' ? event.gesture.deltaX : -event.gesture.deltaX;
         var distance = Math.max(0, Math.min(this._width, this._startDistance + delta));
         if (distance !== this._distance) {
           this._animator.translate(distance);
           this._distance = distance;
           this._state = CHANGING_STATE;
         }
       }
     }, {
       key: '_onDragEnd',
       value: function _onDragEnd(event) {
         var distance = this._distance;
         var width = this._width;
         var el = this._element;

         var direction = event.gesture.interimDirection;
         var shouldOpen = el._side !== direction && distance > width * el._threshold;
         this.executeAction(shouldOpen ? 'open' : 'close');
         this._ignoreDrag = true;
       }
     }, {
       key: 'layout',
       value: function layout() {
         if (this._active && this._state === OPEN_STATE) {
           this._animator.open();
         }
       }
     }, {
       key: 'enterMode',
       value: function enterMode() {
         if (!this._active) {
           this._active = true;
           this.layout();
         }
       }
     }, {
       key: 'exitMode',
       value: function exitMode() {
         this._active = false;
       }
     }, {
       key: '_isOpenOtherSideMenu',
       value: function _isOpenOtherSideMenu() {
         var _this = this;

         return util.arrayFrom(this._element.parentElement.children).some(function (e) {
           return util.match(e, 'ons-splitter-side') && e !== _this._element && e.isOpen;
         });
       }
     }, {
       key: 'executeAction',
       value: function executeAction(name) {
         var _this2 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         var FINAL_STATE = name === 'open' ? OPEN_STATE : CLOSED_STATE;

         if (!this._active) {
           return Promise.resolve(false);
         }

         if (this._state === FINAL_STATE) {
           return Promise.resolve(this._element);
         }
         if (this._lock.isLocked()) {
           return Promise.reject('Splitter side is locked.');
         }
         if (name === 'open' && this._isOpenOtherSideMenu()) {
           return Promise.reject('Another menu is already open.');
         }
         if (this._element._emitEvent('pre' + name)) {
           return Promise.reject('Canceled in pre' + name + ' event.');
         }

         var callback = options.callback;
         var unlock = this._lock.lock();
         var done = function done() {
           _this2._state = FINAL_STATE;
           _this2.layout();
           unlock();
           _this2._element._emitEvent('post' + name);
           callback && callback();
         };

         if (options.withoutAnimation) {
           done();
           return Promise.resolve(this._element);
         }
         this._state = CHANGING_STATE;
         return new Promise(function (resolve) {
           _this2._animator[name](function () {
             done();
             resolve(_this2._element);
           });
         });
       }
     }]);
     return CollapseMode;
   }();

   var SplitterSideElement = function (_BaseElement) {
     babelHelpers.inherits(SplitterSideElement, _BaseElement);

     function SplitterSideElement() {
       babelHelpers.classCallCheck(this, SplitterSideElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SplitterSideElement).apply(this, arguments));
     }

     babelHelpers.createClass(SplitterSideElement, [{
       key: 'init',

       value: function init() {
         var _this4 = this;

         this._page = null;
         this._pageLoader = defaultPageLoader;
         this._collapseMode = new CollapseMode(this);
         this._collapseDetection = new CollapseDetection(this);

         this._animatorFactory = new AnimatorFactory({
           animators: SplitterElement.animators,
           baseClass: SplitterAnimator,
           baseClassName: 'SplitterAnimator',
           defaultAnimation: this.getAttribute('animation')
         });
         this._boundHandleGesture = function (e) {
           return _this4._collapseMode.handleGesture(e);
         };
         this._watchedAttributes = WATCHED_ATTRIBUTES;
         contentReady(this, function () {
           rewritables$2.ready(_this4, function () {
             var page = _this4._getPageTarget();

             if (page) {
               _this4.load(page);
             }
           });
         });
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var _this5 = this;

         if (!util.match(this.parentNode, 'ons-splitter')) {
           throw new Error('Parent must be an ons-splitter element.');
         }

         this._gestureDetector = new GestureDetector(this.parentElement, { dragMinDistance: 1 });

         contentReady(this, function () {
           _this5._watchedAttributes.forEach(function (e) {
             return _this5._update(e);
           });
         });

         if (!this.hasAttribute('side')) {
           this.setAttribute('side', 'left');
         }
       }
     }, {
       key: '_getPageTarget',
       value: function _getPageTarget() {
         return this._page || this.getAttribute('page');
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this._collapseDetection.disable();
         this._gestureDetector.dispose();
         this._gestureDetector = null;
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         this._update(name, current);
       }
     }, {
       key: '_update',
       value: function _update(name, value) {
         name = '_update' + name.split('-').map(function (e) {
           return e[0].toUpperCase() + e.slice(1);
         }).join('');
         return this[name](value);
       }
     }, {
       key: '_emitEvent',
       value: function _emitEvent(name) {
         if (name.slice(0, 3) !== 'pre') {
           return util.triggerElementEvent(this, name, { side: this });
         }
         var isCanceled = false;

         util.triggerElementEvent(this, name, {
           side: this,
           cancel: function cancel() {
             return isCanceled = true;
           }
         });

         return isCanceled;
       }
     }, {
       key: '_updateCollapse',
       value: function _updateCollapse() {
         var value = arguments.length <= 0 || arguments[0] === undefined ? this.getAttribute('collapse') : arguments[0];

         if (value === null || value === 'split') {
           this._collapseDetection.disable();
           return this._updateMode(SPLIT_MODE);
         }
         if (value === '' || value === 'collapse') {
           this._collapseDetection.disable();
           return this._updateMode(COLLAPSE_MODE);
         }

         this._collapseDetection.changeTarget(value);
       }
     }, {
       key: '_updateMode',
       value: function _updateMode(mode) {
         if (mode !== this._mode) {
           this._mode = mode;
           this._collapseMode[mode === COLLAPSE_MODE ? 'enterMode' : 'exitMode']();
           this.setAttribute('mode', mode);

           util.triggerElementEvent(this, 'modechange', { side: this, mode: mode });
         }
       }
     }, {
       key: '_updateOpenThreshold',
       value: function _updateOpenThreshold() {
         var threshold = arguments.length <= 0 || arguments[0] === undefined ? this.getAttribute('open-threshold') : arguments[0];

         this._threshold = Math.max(0, Math.min(1, parseFloat(threshold) || 0.3));
       }
     }, {
       key: '_updateSwipeable',
       value: function _updateSwipeable() {
         var swipeable = arguments.length <= 0 || arguments[0] === undefined ? this.getAttribute('swipeable') : arguments[0];

         var action = swipeable === null ? 'off' : 'on';

         if (this._gestureDetector) {
           this._gestureDetector[action]('dragstart dragleft dragright dragend', this._boundHandleGesture);
         }
       }
     }, {
       key: '_updateSwipeTargetWidth',
       value: function _updateSwipeTargetWidth() {
         var value = arguments.length <= 0 || arguments[0] === undefined ? this.getAttribute('swipe-target-width') : arguments[0];

         this._swipeTargetWidth = Math.max(0, parseInt(value) || 0);
       }
     }, {
       key: '_updateWidth',
       value: function _updateWidth() {
         this.style.width = this._width;
       }
     }, {
       key: '_updateSide',
       value: function _updateSide() {
         var side = arguments.length <= 0 || arguments[0] === undefined ? this.getAttribute('side') : arguments[0];

         this._side = side === 'right' ? side : 'left';
       }
     }, {
       key: '_updateAnimation',
       value: function _updateAnimation() {
         var animation = arguments.length <= 0 || arguments[0] === undefined ? this.getAttribute('animation') : arguments[0];

         this._animator = this._animatorFactory.newAnimator({ animation: animation });
         this._animator.activate(this);
       }
     }, {
       key: '_updateAnimationOptions',
       value: function _updateAnimationOptions() {
         var value = arguments.length <= 0 || arguments[0] === undefined ? this.getAttribute('animation-options') : arguments[0];

         this._animator.updateOptions(AnimatorFactory.parseAnimationOptionsString(value));
       }
     }, {
       key: 'open',

       value: function open() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         return this._collapseMode.executeAction('open', options);
       }
     }, {
       key: 'close',
       value: function close() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         return this._collapseMode.executeAction('close', options);
       }
     }, {
       key: 'toggle',
       value: function toggle() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         return this.isOpen ? this.close(options) : this.open(options);
       }
     }, {
       key: 'load',
       value: function load(page) {
         var _this6 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         this._page = page;
         var callback = options.callback || function () {};

         return new Promise(function (resolve) {
           _this6._pageLoader.load({ page: page, parent: _this6, replace: true }, function (_ref) {
             var element = _ref.element;
             var unload = _ref.unload;

             rewritables$2.link(_this6, element, options, function (fragment) {
               setImmediate(function () {
                 return _this6._show();
               });
               callback();

               resolve(_this6.firstChild);
             });
           });
         });
       }
     }, {
       key: '_show',
       value: function _show() {
         util.propagateAction(this, '_show');
       }
     }, {
       key: '_hide',
       value: function _hide() {
         util.propagateAction(this, '_hide');
       }
     }, {
       key: '_destroy',
       value: function _destroy() {
         util.propagateAction(this, '_destroy');
         this.remove();
       }
     }, {
       key: '_width',
       get: function get() {
         var width = this.getAttribute('width');
         return (/^\d+(px|%)$/.test(width) ? width : '80%'
         );
       },
       set: function set(value) {
         this.setAttribute('width', value);
       }
     }, {
       key: 'page',
       get: function get() {
         return this._page;
       }

       ,
       set: function set(page) {
         this._page = page;
       }
     }, {
       key: 'pageLoader',
       get: function get() {
         return this._pageLoader;
       },
       set: function set(loader) {
         if (!(loader instanceof PageLoader)) {
           throw Error('First parameter must be an instance of PageLoader.');
         }
         this._pageLoader = loader;
       }
     }, {
       key: 'mode',
       get: function get() {
         return this._mode;
       }
     }, {
       key: 'isOpen',
       get: function get() {
         return this._collapseMode.isOpen();
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return WATCHED_ATTRIBUTES;
       }
     }, {
       key: 'rewritables',
       get: function get() {
         return rewritables$2;
       }
     }]);
     return SplitterSideElement;
   }(BaseElement);

   customElements.define('ons-splitter-side', SplitterSideElement);

   var scheme$19 = {
     '': 'switch--*',
     '.switch__input': 'switch--*__input',
     '.switch__handle': 'switch--*__handle',
     '.switch__toggle': 'switch--*__toggle'
   };

   var template$2 = util.createFragment('<input type="checkbox" class="switch__input"><div class="switch__toggle">' +
    '<div class="switch__handle"><div class="switch__touch"></div></div></div>');

   var locations = {
     ios: [1, 21],
     material: [0, 16]
   };

   var SwitchElement = function (_BaseElement) {
     babelHelpers.inherits(SwitchElement, _BaseElement);

     function SwitchElement() {
       babelHelpers.classCallCheck(this, SwitchElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SwitchElement).apply(this, arguments));
     }

     babelHelpers.createClass(SwitchElement, [{
       key: 'init',
       value: function init() {
         var _this2 = this;

         this._checked = false;
         this._disabled = false;

         this._boundOnChange = this._onChange.bind(this);

         this._compile();

         ['checked', 'disabled', 'modifier', 'name', 'input-id'].forEach(function (e) {
           _this2.attributeChangedCallback(e, null, _this2.getAttribute(e));
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         this.classList.add('switch');

         if (!(util.findChild(this, '.switch__input') && util.findChild(this, '.switch__toggle'))) {
           this.appendChild(template$2.cloneNode(true));
         }

         ModifierUtil.initModifier(this, scheme$19);

         this._checkbox = this.querySelector('.switch__input');
         this._handle = this.querySelector('.switch__handle');

         this._checkbox.checked = this._checked;
         this._checkbox.disbled = this._disabled;
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this._checkbox.removeEventListener('change', this._boundOnChange);
         this.removeEventListener('dragstart', this._onDragStart);
         this.removeEventListener('hold', this._onHold);
         this.removeEventListener('tap', this.click);
         this.removeEventListener('click', this._onClick);
         this._gestureDetector.dispose();
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this._checkbox.addEventListener('change', this._boundOnChange);
         this.addEventListener('dragstart', this._onDragStart);
         this.addEventListener('hold', this._onHold);
         this.addEventListener('tap', this.click);
         this.addEventListener('click', this._onClick);
         this._gestureDetector = new GestureDetector(this, { dragMinDistance: 1, holdTimeout: 251 });
         this._boundOnRelease = this._onRelease.bind(this);
       }
     }, {
       key: '_onChange',
       value: function _onChange(event) {
         util.toggleAttribute(this, 'checked', this.checkbox.checked);
       }
     }, {
       key: '_onClick',
       value: function _onClick(ev) {
         if (ev.target.classList.contains('switch__touch')) {
           ev.preventDefault();
         }
       }
     }, {
       key: 'click',
       value: function click() {
         if (!this._disabled) {
           this.checked = !this.checked;

           util.triggerElementEvent(this, 'change', {
             value: this.checked,
             switch: this,
             isInteractive: true
           });
         }
       }
     }, {
       key: '_getPosition',
       value: function _getPosition(e) {
         var l = this._locations;
         return Math.min(l[1], Math.max(l[0], this._startX + e.gesture.deltaX));
       }
     }, {
       key: '_onHold',
       value: function _onHold(e) {
         if (!this.disabled) {
           this.classList.add('switch--active');
           document.addEventListener('release', this._boundOnRelease);
         }
       }
     }, {
       key: '_onDragStart',
       value: function _onDragStart(e) {
         if (this.disabled || ['left', 'right'].indexOf(e.gesture.direction) === -1) {
           this.classList.remove('switch--active');
           return;
         }

         e.stopPropagation();

         this.classList.add('switch--active');
         this._startX = this._locations[this.checked ? 1 : 0]; // - e.gesture.deltaX;

         this.addEventListener('drag', this._onDrag);
         document.addEventListener('release', this._boundOnRelease);
       }
     }, {
       key: '_onDrag',
       value: function _onDrag(e) {
         e.gesture.srcEvent.preventDefault();
         this._handle.style.left = this._getPosition(e) + 'px';
       }
     }, {
       key: '_onRelease',
       value: function _onRelease(e) {
         var l = this._locations;
         var position = this._getPosition(e);

         this.checked = position >= (l[0] + l[1]) / 2;

         this.removeEventListener('drag', this._onDrag);
         document.removeEventListener('release', this._boundOnRelease);

         this._handle.style.left = '';
         this.classList.remove('switch--active');
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         switch (name) {
           case 'modifier':
             this._isMaterial = (current || '').indexOf('material') !== -1;
             this._locations = locations[this._isMaterial ? 'material' : 'ios'];
             ModifierUtil.onModifierChanged(last, current, this, scheme$19);
             break;
           case 'input-id':
             this._checkbox.id = current;
             break;
           case 'checked':
             this._checked = current !== null;
             this._checkbox.checked = current !== null;
             util.toggleAttribute(this._checkbox, name, current !== null);
             break;
           case 'disabled':
             this._disabled = current !== null;
             this._checkbox.disabled = current !== null;
             util.toggleAttribute(this._checkbox, name, current !== null);
         }
       }
     }, {
       key: 'checked',

       get: function get() {
         return this._checked;
       },
       set: function set(value) {
         this._checked = !!value;
         util.toggleAttribute(this, 'checked', this._checked);

         if (this._checked !== this._checkbox.checked) {
           this._checkbox.click();
         }
       }
     }, {
       key: 'disabled',
       get: function get() {
         return this._disabled;
       },
       set: function set(value) {
         this._disabled = !!value;
         util.toggleAttribute(this, 'disabled', this._disabled);
         this._checkbox.disabled = this._disabled;
       }
     }, {
       key: 'checkbox',
       get: function get() {
         return this._checkbox;
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'input-id', 'checked', 'disabled'];
       }
     }]);
     return SwitchElement;
   }(BaseElement);

   customElements.define('ons-switch', SwitchElement);

   var TabbarAnimator = function () {
     function TabbarAnimator() {
       var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
       babelHelpers.classCallCheck(this, TabbarAnimator);

       this.timing = options.timing || 'linear';
       this.duration = options.duration !== undefined ? options.duration : '0.4';
       this.delay = options.delay !== undefined ? options.delay : '0';
     }

     babelHelpers.createClass(TabbarAnimator, [{
       key: 'apply',
       value: function apply(enterPage, leavePage, enterPageIndex, leavePageIndex, done) {
         throw new Error('This method must be implemented.');
       }
     }]);
     return TabbarAnimator;
   }();

   var TabbarNoneAnimator = function (_TabbarAnimator) {
     babelHelpers.inherits(TabbarNoneAnimator, _TabbarAnimator);

     function TabbarNoneAnimator() {
       babelHelpers.classCallCheck(this, TabbarNoneAnimator);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(TabbarNoneAnimator).apply(this, arguments));
     }

     babelHelpers.createClass(TabbarNoneAnimator, [{
       key: 'apply',
       value: function apply(enterPage, leavePage, enterIndex, leaveIndex, done) {
         setTimeout(done, 1000 / 60);
       }
     }]);
     return TabbarNoneAnimator;
   }(TabbarAnimator);

   var TabbarFadeAnimator = function (_TabbarAnimator2) {
     babelHelpers.inherits(TabbarFadeAnimator, _TabbarAnimator2);

     function TabbarFadeAnimator(options) {
       babelHelpers.classCallCheck(this, TabbarFadeAnimator);

       options.timing = options.timing !== undefined ? options.timing : 'linear';
       options.duration = options.duration !== undefined ? options.duration : '0.4';
       options.delay = options.delay !== undefined ? options.delay : '0';

       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(TabbarFadeAnimator).call(this, options));
     }

     babelHelpers.createClass(TabbarFadeAnimator, [{
       key: 'apply',
       value: function apply(enterPage, leavePage, enterPageIndex, leavePageIndex, done) {
         animit.runAll(animit(enterPage).saveStyle().queue({
           transform: 'translate3D(0, 0, 0)',
           opacity: 0
         }).wait(this.delay).queue({
           transform: 'translate3D(0, 0, 0)',
           opacity: 1
         }, {
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (callback) {
           done();
           callback();
         }), animit(leavePage).queue({
           transform: 'translate3D(0, 0, 0)',
           opacity: 1
         }).wait(this.delay).queue({
           transform: 'translate3D(0, 0, 0)',
           opacity: 0
         }, {
           duration: this.duration,
           timing: this.timing
         }));
       }
     }]);
     return TabbarFadeAnimator;
   }(TabbarAnimator);

   var TabbarSlideAnimator = function (_TabbarAnimator3) {
     babelHelpers.inherits(TabbarSlideAnimator, _TabbarAnimator3);

     function TabbarSlideAnimator(options) {
       babelHelpers.classCallCheck(this, TabbarSlideAnimator);

       options.timing = options.timing !== undefined ? options.timing : 'ease-in';
       options.duration = options.duration !== undefined ? options.duration : '0.15';
       options.delay = options.delay !== undefined ? options.delay : '0';

       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(TabbarSlideAnimator).call(this, options));
     }

     babelHelpers.createClass(TabbarSlideAnimator, [{
       key: 'apply',
       value: function apply(enterPage, leavePage, enterIndex, leaveIndex, done) {
         var sgn = enterIndex > leaveIndex;

         animit.runAll(animit(enterPage).saveStyle().queue({
           transform: 'translate3D(' + (sgn ? '' : '-') + '100%, 0, 0)'
         }).wait(this.delay).queue({
           transform: 'translate3D(0, 0, 0)'
         }, {
           duration: this.duration,
           timing: this.timing
         }).restoreStyle().queue(function (callback) {
           done();
           callback();
         }), animit(leavePage).queue({
           transform: 'translate3D(0, 0, 0)'
         }).wait(this.delay).queue({
           transform: 'translate3D(' + (sgn ? '-' : '') + '100%, 0, 0)'
         }, {
           duration: this.duration,
           timing: this.timing
         }));
       }
     }]);
     return TabbarSlideAnimator;
   }(TabbarAnimator);

   var scheme$21 = {
     '.tab-bar__content': 'tab-bar--*__content',
     '.tab-bar': 'tab-bar--*'
   };

   var _animatorDict$6 = {
     'default': TabbarNoneAnimator,
     'fade': TabbarFadeAnimator,
     'slide': TabbarSlideAnimator,
     'none': TabbarNoneAnimator
   };

   var rewritables$3 = {
     ready: function ready(tabbarElement, callback) {
       callback();
     },

     link: function link(tabbarElement, target, options, callback) {
       callback(target);
     },

     unlink: function unlink(tabbarElement, target, callback) {
       callback(target);
     }
   };

   var generateId$1 = function () {
     var i = 0;
     return function () {
       return 'ons-tabbar-gen-' + i++;
     };
   }();

   var TabbarElement = function (_BaseElement) {
     babelHelpers.inherits(TabbarElement, _BaseElement);

     function TabbarElement() {
       babelHelpers.classCallCheck(this, TabbarElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(TabbarElement).apply(this, arguments));
     }

     babelHelpers.createClass(TabbarElement, [{
       key: 'init',

       value: function init() {
         var _this2 = this;

         this._tabbarId = generateId$1();

         contentReady(this, function () {
           _this2._compile();

           var content = _this2._contentElement;
           for (var i = 0; i < content.children.length; i++) {
             content.children[i].style.display = 'none';
           }

           var activeIndex = _this2.getAttribute('activeIndex');

           var tabbar = _this2._tabbarElement;
           if (activeIndex && tabbar.children.length > activeIndex) {
             tabbar.children[activeIndex].setAttribute('active', 'true');
           }

           autoStyle.prepare(_this2);
           ModifierUtil.initModifier(_this2, scheme$21);

           _this2._animatorFactory = new AnimatorFactory({
             animators: _animatorDict$6,
             baseClass: TabbarAnimator,
             baseClassName: 'TabbarAnimator',
             defaultAnimation: _this2.getAttribute('animation')
           });
         });
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var _this3 = this;

         contentReady(this, function () {
           return _this3._updatePosition();
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         if (this._contentElement && this._tabbarElement) {
           var content = util.findChild(this, '.tab-bar__content');
           var bar = util.findChild(this, '.tab-bar');

           content.classList.add('ons-tab-bar__content');
           bar.classList.add('ons-tab-bar__footer');
         } else {
           var _content = util.create('.ons-tab-bar__content.tab-bar__content');
           var tabbar = util.create('.tab-bar.ons-tab-bar__footer');

           while (this.firstChild) {
             tabbar.appendChild(this.firstChild);
           }

           this.appendChild(_content);
           this.appendChild(tabbar);
         }
       }
     }, {
       key: '_updatePosition',
       value: function _updatePosition() {
         var _this4 = this;

         var position = arguments.length <= 0 || arguments[0] === undefined ? this.getAttribute('position') : arguments[0];

         var top = this._top = position === 'top' || position === 'auto' && platform.isAndroid();
         var action = top ? util.addModifier : util.removeModifier;

         action(this, 'top');

         var page = util.findParent(this, 'ons-page');
         if (page) {
           this.style.top = top ? window.getComputedStyle(page._getContentElement(), null).getPropertyValue('padding-top') : '';

           if (util.match(page.firstChild, 'ons-toolbar')) {
             action(page.firstChild, 'noshadow');
           }
         }

         internal.autoStatusBarFill(function () {
           var filled = util.findParent(_this4, function (e) {
             return e.hasAttribute('status-bar-fill');
           });
           util.toggleAttribute(_this4, 'status-bar-fill', top && !filled);
         });
       }
     }, {
       key: '_getTabbarElement',
       value: function _getTabbarElement() {
         return util.findChild(this, '.tab-bar');
       }
     }, {
       key: 'loadPage',
       value: function loadPage(page) {
         var _this5 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         return new Promise(function (resolve) {
           var tab = _this5._tabbarElement.children[0] || new TabElement();
           tab._loadPage(page, _this5._contentElement, function (pageElement) {
             resolve(_this5._loadPageDOMAsync(pageElement, options));
           });
         });
       }
     }, {
       key: '_loadPageDOMAsync',
       value: function _loadPageDOMAsync(pageElement) {
         var _this6 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         return new Promise(function (resolve) {
           rewritables$3.link(_this6, pageElement, options, function (pageElement) {
             _this6._contentElement.appendChild(pageElement);

             if (_this6.getActiveTabIndex() !== -1) {
               resolve(_this6._switchPage(pageElement, options));
             } else {
               if (options.callback instanceof Function) {
                 options.callback();
               }

               _this6._oldPageElement = pageElement;
               resolve(pageElement);
             }
           });
         });
       }
     }, {
       key: 'getTabbarId',
       value: function getTabbarId() {
         return this._tabbarId;
       }
     }, {
       key: '_getCurrentPageElement',
       value: function _getCurrentPageElement() {
         var pages = this._contentElement.children;
         var page = null;
         for (var i = 0; i < pages.length; i++) {
           if (pages[i].style.display !== 'none') {
             page = pages[i];
             break;
           }
         }

         if (page && page.nodeName.toLowerCase() !== 'ons-page') {
           throw new Error('Invalid state: page element must be a "ons-page" element.');
         }

         return page;
       }
     }, {
       key: '_switchPage',

       value: function _switchPage(element, options) {
         var oldPageElement = this._oldPageElement || internal.nullElement;
         this._oldPageElement = element;
         var animator = this._animatorFactory.newAnimator(options);

         return new Promise(function (resolve) {
           if (oldPageElement !== internal.nullElement) {
             oldPageElement._hide();
           }

           animator.apply(element, oldPageElement, options.selectedTabIndex, options.previousTabIndex, function () {
             if (oldPageElement !== internal.nullElement) {
               oldPageElement.style.display = 'none';
             }

             element.style.display = 'block';
             element._show();

             if (options.callback instanceof Function) {
               options.callback();
             }

             resolve(element);
           });
         });
       }
     }, {
       key: 'setActiveTab',
       value: function setActiveTab(index) {
         var _this7 = this;

         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         if (options && (typeof options === 'undefined' ? 'undefined' : babelHelpers.typeof(options)) != 'object') {
           throw new Error('options must be an object. You supplied ' + options);
         }

         options.animationOptions = util.extend(options.animationOptions || {}, 
          AnimatorFactory.parseAnimationOptionsString(this.getAttribute('animation-options')));

         if (!options.animation && this.hasAttribute('animation')) {
           options.animation = this.getAttribute('animation');
         }

         var previousTab = this._getActiveTabElement(),
             selectedTab = this._getTabElement(index),
             previousTabIndex = this.getActiveTabIndex(),
             selectedTabIndex = index,
             previousPageElement = this._getCurrentPageElement();

         if (!selectedTab) {
           return Promise.reject('Specified index does not match any tab.');
         }

         if (selectedTabIndex === previousTabIndex) {
           util.triggerElementEvent(this, 'reactive', {
             index: selectedTabIndex,
             tabItem: selectedTab
           });

           return Promise.resolve(previousPageElement);
         }

         var canceled = false;

         util.triggerElementEvent(this, 'prechange', {
           index: selectedTabIndex,
           tabItem: selectedTab,
           cancel: function cancel() {
             return canceled = true;
           }
         });

         if (canceled) {
           selectedTab.setInactive();
           if (previousTab) {
             previousTab.setActive();
           }
           return Promise.reject('Canceled in prechange event.');
         }

         selectedTab.setActive();

         var needLoad = !options.keepPage;

         util.arrayFrom(this._getTabbarElement().children).forEach(function (tab) {
           if (tab != selectedTab) {
             tab.setInactive();
           } else {
             if (!needLoad) {
               util.triggerElementEvent(_this7, 'postchange', {
                 index: selectedTabIndex,
                 tabItem: selectedTab
               });
             }
           }
         });

         if (needLoad) {
           var _ret = function () {
             var removeElement = false;

             if (!previousTab && previousPageElement || previousTab && previousTab._pageElement !== previousPageElement) {
               removeElement = true;
             }

             var params = {
               callback: function callback() {
                 util.triggerElementEvent(_this7, 'postchange', {
                   index: selectedTabIndex,
                   tabItem: selectedTab
                 });

                 if (options.callback instanceof Function) {
                   options.callback();
                 }
               },
               previousTabIndex: previousTabIndex,
               selectedTabIndex: selectedTabIndex
             };

             if (options.animation) {
               params.animation = options.animation;
             }

             params.animationOptions = options.animationOptions || {};

             var link = function link(element, callback) {
               rewritables$3.link(_this7, element, options, callback);
             };

             return {
               v: new Promise(function (resolve) {
                 selectedTab._loadPageElement(_this7._contentElement, function (pageElement) {
                   pageElement.style.display = 'block';
                   resolve(_this7._loadPersistentPageDOM(pageElement, params));
                 }, link);
               })
             };
           }();

           if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
         } else {
           return new Promise(function (resolve) {
             _this7._contentElement.appendChild(selectedTab.pageElement);
             selectedTab.pageElement.style.display = 'block';
             resolve(_this7._loadPersistentPageDOM(selectedTab.pageElement, params));
           });
         }
       }
     }, {
       key: '_loadPersistentPageDOM',
       value: function _loadPersistentPageDOM(element) {
         var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

         if (!util.isAttached(element)) {
           this._contentElement.appendChild(element);
         }

         element.removeAttribute('style');
         return this._switchPage(element, options);
       }
     }, {
       key: 'setTabbarVisibility',
       value: function setTabbarVisibility(visible) {
         this._contentElement.style[this._top ? 'top' : 'bottom'] = visible ? '' : '0px';
         this._getTabbarElement().style.display = visible ? '' : 'none';
       }
     }, {
       key: 'getActiveTabIndex',
       value: function getActiveTabIndex() {
         var tabs = this._getTabbarElement().children;

         for (var i = 0; i < tabs.length; i++) {
           if (tabs[i] instanceof TabElement && tabs[i].isActive && tabs[i].isActive()) {
             return i;
           }
         }

         return -1;
       }
     }, {
       key: '_getActiveTabElement',
       value: function _getActiveTabElement() {
         return this._getTabElement(this.getActiveTabIndex());
       }
     }, {
       key: '_getTabElement',
       value: function _getTabElement(index) {
         return this._getTabbarElement().children[index];
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {}
     }, {
       key: '_show',
       value: function _show() {
         var currentPageElement = this._getCurrentPageElement();
         if (currentPageElement) {
           currentPageElement._show();
         }
       }
     }, {
       key: '_hide',
       value: function _hide() {
         var currentPageElement = this._getCurrentPageElement();
         if (currentPageElement) {
           currentPageElement._hide();
         }
       }
     }, {
       key: '_destroy',
       value: function _destroy() {
         var pages = this._contentElement.children;
         for (var i = pages.length - 1; i >= 0; i--) {
           pages[i]._destroy();
         }
         this.remove();
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$21);
         }
       }
     }, {
       key: '_contentElement',
       get: function get() {
         return util.findChild(this, '.tab-bar__content');
       }
     }, {
       key: '_tabbarElement',
       get: function get() {
         return util.findChild(this, '.tab-bar');
       }
     }, {
       key: 'pages',
       get: function get() {
         return util.arrayFrom(this._contentElement.children);
       }
     }], [{
       key: 'registerAnimator',

       value: function registerAnimator(name, Animator) {
         if (!(Animator.prototype instanceof TabbarAnimator)) {
           throw new Error('"Animator" param must inherit TabbarElement.TabbarAnimator');
         }
         _animatorDict$6[name] = Animator;
       }
     }, {
       key: 'observedAttributes',
       get: function get() {
         return ['modifier'];
       }
     }, {
       key: 'rewritables',
       get: function get() {
         return rewritables$3;
       }
     }, {
       key: 'TabbarAnimator',
       get: function get() {
         return TabbarAnimator;
       }
     }]);
     return TabbarElement;
   }(BaseElement);

   customElements.define('ons-tabbar', TabbarElement);

   var scheme$20 = {
     '': 'tab-bar--*__item',
     '.tab-bar__button': 'tab-bar--*__button'
   };
   var templateSource$1 = util.createElement(
      '<div><input type="radio" style="display: none"><button class="tab-bar__button"></button></div>');
   var defaultInnerTemplateSource = util.createElement(
      '<div><div class="tab-bar__icon"><ons-icon icon="ion-cloud"></ons-icon></div><div class="tab-bar__label">label</div></div>');

   var TabElement = function (_BaseElement) {
     babelHelpers.inherits(TabElement, _BaseElement);

     function TabElement() {
       babelHelpers.classCallCheck(this, TabElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(TabElement).apply(this, arguments));
     }

     babelHelpers.createClass(TabElement, [{
       key: 'init',
       value: function init() {
         var _this2 = this;

         this._pageLoader = defaultPageLoader;
         this._page = null;

         if (this.hasAttribute('label') || this.hasAttribute('icon')) {
           this._compile();
         } else {
           contentReady(this, function () {
             _this2._compile();
           });
         }

         this._boundOnClick = this._onClick.bind(this);
       }
     }, {
       key: '_getPageTarget',
       value: function _getPageTarget() {
         return this.page || this.getAttribute('page');
       }
     }, {
       key: '_templateLoaded',
       value: function _templateLoaded() {
         if (this.children.length == 0) {
           return false;
         }

         var hasInput = this.children[0].getAttribute('type') === 'radio';
         var hasButton = util.findChild(this, '.tab-bar__button');

         return hasInput && hasButton;
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         this.classList.add('tab-bar__item');

         if (!this._templateLoaded()) {
           var fragment = document.createDocumentFragment();
           var hasChildren = false;

           while (this.childNodes[0]) {
             var node = this.childNodes[0];
             this.removeChild(node);
             fragment.appendChild(node);

             if (node.nodeType == Node.ELEMENT_NODE) {
               hasChildren = true;
             }
           }

           var template = templateSource$1.cloneNode(true);
           while (template.children[0]) {
             this.appendChild(template.children[0]);
           }

           var button = util.findChild(this, '.tab-bar__button');

           if (hasChildren) {
             button.appendChild(fragment);
             this._hasDefaultTemplate = false;
           } else {
             this._hasDefaultTemplate = true;
             this._updateDefaultTemplate();
           }
         }

         ModifierUtil.initModifier(this, scheme$20);
         this._updateRipple();
       }
     }, {
       key: '_updateRipple',
       value: function _updateRipple() {
       }
     }, {
       key: '_updateDefaultTemplate',
       value: function _updateDefaultTemplate() {
         if (!this._hasDefaultTemplate) {
           return;
         }

         var button = util.findChild(this, '.tab-bar__button');

         if (button.children.length == 0) {
           var template = defaultInnerTemplateSource.cloneNode(true);
           while (template.children[0]) {
             button.appendChild(template.children[0]);
           }

           if (!button.querySelector('.tab-bar__icon')) {
             button.insertBefore(template.querySelector('.tab-bar__icon'), button.firstChild);
           }

           if (!button.querySelector('.tab-bar__label')) {
             button.appendChild(template.querySelector('.tab-bar__label'));
           }
         }

         var self = this;
         var icon = this.getAttribute('icon');
         var label = this.getAttribute('label');

         if (typeof icon === 'string') {
           getIconElement().setAttribute('icon', icon);
         } else {
           var wrapper = button.querySelector('.tab-bar__icon');
           if (wrapper) {
             wrapper.remove();
           }
         }

         if (typeof label === 'string') {
           getLabelElement().textContent = label;
         } else {
           var _label = getLabelElement();
           if (_label) {
             _label.remove();
           }
         }

         function getLabelElement() {
           return self.querySelector('.tab-bar__label');
         }

         function getIconElement() {
           return self.querySelector('ons-icon');
         }
       }
     }, {
       key: '_onClick',
       value: function _onClick() {
         var tabbar = this._findTabbarElement();
         if (tabbar) {
           tabbar.setActiveTab(this._findTabIndex());
         }
       }
     }, {
       key: 'setActive',
       value: function setActive() {
         var radio = util.findChild(this, 'input');
         radio.checked = true;
         this.classList.add('active');

         util.arrayFrom(this.querySelectorAll('[ons-tab-inactive], ons-tab-inactive')).forEach(function (element) {
           return element.style.display = 'none';
         });
         util.arrayFrom(this.querySelectorAll('[ons-tab-active], ons-tab-active')).forEach(function (element) {
           return element.style.display = 'inherit';
         });
       }
     }, {
       key: 'setInactive',
       value: function setInactive() {
         var radio = util.findChild(this, 'input');
         radio.checked = false;
         this.classList.remove('active');

         util.arrayFrom(this.querySelectorAll('[ons-tab-inactive], ons-tab-inactive')).forEach(function (element) {
           return element.style.display = 'inherit';
         });
         util.arrayFrom(this.querySelectorAll('[ons-tab-active], ons-tab-active')).forEach(function (element) {
           return element.style.display = 'none';
         });
       }
     }, {
       key: '_loadPageElement',
       value: function _loadPageElement(parent, callback, link) {
         var _this3 = this;

         if (!this._loadedPage && !this._getPageTarget()) {
           var pages = this._findTabbarElement().pages;
           var index = this._findTabIndex();
           callback(pages[index]);
         } else if (!this._loadedPage) {
           this._pageLoader.load({ page: this._getPageTarget(), parent: parent }, function (page) {
             _this3._loadedPage = page;
             link(page.element, function (element) {
               page.element = element;
               callback(page.element);
             });
           });
         } else {
           callback(this._loadedPage.element);
         }
       }
     }, {
       key: '_loadPage',
       value: function _loadPage(page, parent, callback) {
         this._pageLoader.load({ page: page, parent: parent }, function (page) {
           callback(page.element);
         });
       }
     }, {
       key: 'isActive',

       value: function isActive() {
         return this.classList.contains('active');
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this.removeEventListener('click', this._boundOnClick, false);
         if (this._loadedPage) {
           this._loadedPage.unload();
           this._loadedPage = null;
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         var _this4 = this;

         contentReady(this, function () {
           _this4._ensureElementPosition();

           var tabbar = _this4._findTabbarElement();

           if (tabbar.hasAttribute('modifier')) {
             var prefix = _this4.hasAttribute('modifier') ? _this4.getAttribute('modifier') + ' ' : '';
             _this4.setAttribute('modifier', prefix + tabbar.getAttribute('modifier'));
           }

           if (_this4.hasAttribute('active')) {
             (function () {
               var tabIndex = _this4._findTabIndex();

               TabbarElement.rewritables.ready(tabbar, function () {
                 setImmediate(function () {
                   return tabbar.setActiveTab(tabIndex, { animation: 'none' });
                 });
               });
             })();
           } else {
             var onReady = function onReady() {
               if (_this4._getPageTarget()) {
                 _this4._loadPageElement(tabbar._contentElement, function (pageElement) {
                   pageElement.style.display = 'none';
                   tabbar._contentElement.appendChild(pageElement);
                 }, function (pageElement, done) {
                   TabbarElement.rewritables.link(tabbar, pageElement, {}, function (element) {
                     return done(element);
                   });
                 });
               }
             };
             TabbarElement.rewritables.ready(tabbar, onReady);
           }

           _this4.addEventListener('click', _this4._boundOnClick, false);
         });
       }
     }, {
       key: '_findTabbarElement',
       value: function _findTabbarElement() {
         if (this.parentNode && this.parentNode.nodeName.toLowerCase() === 'ons-tabbar') {
           return this.parentNode;
         }

         if (this.parentNode.parentNode && this.parentNode.parentNode.nodeName.toLowerCase() === 'ons-tabbar') {
           return this.parentNode.parentNode;
         }

         return null;
       }
     }, {
       key: '_findTabIndex',
       value: function _findTabIndex() {
         var elements = this.parentNode.children;
         for (var i = 0; i < elements.length; i++) {
           if (this === elements[i]) {
             return i;
           }
         }
       }
     }, {
       key: '_ensureElementPosition',
       value: function _ensureElementPosition() {
         if (!this._findTabbarElement()) {
           throw new Error('This ons-tab element is must be child of ons-tabbar element.');
         }
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         var _this5 = this;

         switch (name) {
           case 'modifier':
             contentReady(this, function () {
               return ModifierUtil.onModifierChanged(last, current, _this5, scheme$20);
             });
             break;
           case 'ripple':
             contentReady(this, function () {
               return _this5._updateRipple();
             });
             break;
           case 'icon':
           case 'label':
             contentReady(this, function () {
               return _this5._updateDefaultTemplate();
             });
             break;
           case 'page':
             if (typeof current === 'string') {
               this._page = current;
             }
             break;
         }
       }
     }, {
       key: 'page',
       set: function set(page) {
         this._page = page;
       },
       get: function get() {
         return this._page;
       }
     }, {
       key: 'pageLoader',
       set: function set(loader) {
         if (!(loader instanceof PageLoader)) {
           throw Error('First parameter must be an instance of PageLoader.');
         }
         this._pageLoader = loader;
       },
       get: function get() {
         return this._pageLoader;
       }
     }, {
       key: 'pageElement',
       get: function get() {
         if (this._loadedPage) {
           return this._loadedPage.element;
         }

         var tabbar = this._findTabbarElement();
         var index = this._findTabIndex();

         return tabbar._contentElement.children[index];
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier', 'ripple', 'icon', 'label', 'page'];
       }
     }]);
     return TabElement;
   }(BaseElement);

   customElements.define('ons-tab', TabElement);

   var scheme$22 = { '': 'toolbar-button--*' };

   var ToolbarButtonElement = function (_BaseElement) {
     babelHelpers.inherits(ToolbarButtonElement, _BaseElement);

     function ToolbarButtonElement() {
       babelHelpers.classCallCheck(this, ToolbarButtonElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ToolbarButtonElement).apply(this, arguments));
     }

     babelHelpers.createClass(ToolbarButtonElement, [{
       key: 'init',

       value: function init() {
         this._compile();
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         this.classList.add('toolbar-button');

         ModifierUtil.initModifier(this, scheme$22);
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         if (name === 'modifier') {
           return ModifierUtil.onModifierChanged(last, current, this, scheme$22);
         }
       }
     }, {
       key: 'disabled',
       set: function set(value) {
         return util.toggleAttribute(this, 'disabled', value);
       },
       get: function get() {
         return this.hasAttribute('disabled');
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier'];
       }
     }]);
     return ToolbarButtonElement;
   }(BaseElement);

   customElements.define('ons-toolbar-button', ToolbarButtonElement);

   var scheme$23 = {
     '.range': 'range--*',
     '.range__left': 'range--*__left'
   };

   var templateSource$2 = util.createElement('<div><div class="range__left"></div><input type="range" class="range"></div>');

   var INPUT_ATTRIBUTES$1 = ['autofocus', 'disabled', 'inputmode', 'max', 'min', 'name', 'placeholder', 'readonly', 
    'size', 'step', 'validator', 'value'];

   var RangeElement = function (_BaseElement) {
     babelHelpers.inherits(RangeElement, _BaseElement);

     function RangeElement() {
       babelHelpers.classCallCheck(this, RangeElement);
       return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(RangeElement).apply(this, arguments));
     }

     babelHelpers.createClass(RangeElement, [{
       key: 'init',
       value: function init() {
         var _this2 = this;

         contentReady(this, function () {
           _this2._compile();
           _this2._updateBoundAttributes();
           _this2._onChange();
         });
       }
     }, {
       key: '_compile',
       value: function _compile() {
         autoStyle.prepare(this);

         if (!(util.findChild(this, '.range__left') && util.findChild(this, 'input'))) {
           var template = templateSource$2.cloneNode(true);
           while (template.children[0]) {
             this.appendChild(template.children[0]);
           }
         }

         ModifierUtil.initModifier(this, scheme$23);
       }
     }, {
       key: '_onChange',
       value: function _onChange() {
         this._left.style.width = 100 * this._ratio + '%';
       }
     }, {
       key: '_onDragstart',
       value: function _onDragstart(e) {
         e.stopPropagation();
         e.gesture.stopPropagation();
       }
     }, {
       key: 'attributeChangedCallback',
       value: function attributeChangedCallback(name, last, current) {
         var _this3 = this;

         if (name === 'modifier') {
           ModifierUtil.onModifierChanged(last, current, this, scheme$23);
         } else if (INPUT_ATTRIBUTES$1.indexOf(name) >= 0) {
           contentReady(this, function () {
             _this3._updateBoundAttributes();

             if (name === 'min' || name === 'max') {
               _this3._onChange();
             }
           });
         }
       }
     }, {
       key: 'connectedCallback',
       value: function connectedCallback() {
         this.addEventListener('dragstart', this._onDragstart);
         this.addEventListener('input', this._onChange);
       }
     }, {
       key: 'disconnectedCallback',
       value: function disconnectedCallback() {
         this.removeEventListener('dragstart', this._onDragstart);
         this.removeEventListener('input', this._onChange);
       }
     }, {
       key: '_updateBoundAttributes',
       value: function _updateBoundAttributes() {
         var _this4 = this;

         INPUT_ATTRIBUTES$1.forEach(function (attr) {
           if (_this4.hasAttribute(attr)) {
             _this4._input.setAttribute(attr, _this4.getAttribute(attr));
           } else {
             _this4._input.removeAttribute(attr);
           }
         });
       }
     }, {
       key: '_ratio',
       get: function get() {
         var min = this._input.min === '' ? 0 : parseInt(this._input.min);
         var max = this._input.max === '' ? 100 : parseInt(this._input.max);

         return (this.value - min) / (max - min);
       }
     }, {
       key: '_input',
       get: function get() {
         return this.querySelector('input');
       }
     }, {
       key: '_left',
       get: function get() {
         return this.querySelector('.range__left');
       }
     }, {
       key: 'disabled',
       set: function set(value) {
         return util.toggleAttribute(this, 'disabled', value);
       },
       get: function get() {
         return this.hasAttribute('disabled');
       }
     }, {
       key: 'value',
       get: function get() {
         return this._input.value;
       },
       set: function set(val) {
         var _this5 = this;

         contentReady(this, function () {
           _this5._input.value = val;
           _this5._onChange();
         });
       }
     }], [{
       key: 'observedAttributes',
       get: function get() {
         return ['modifier'].concat(INPUT_ATTRIBUTES$1);
       }
     }]);
     return RangeElement;
   }(BaseElement);

   customElements.define('ons-range', RangeElement);

   ons.TemplateElement = TemplateElement;
   ons.IfElement = IfElement;
   ons.AlertDialogElement = AlertDialogElement;
   ons.BackButtonElement = BackButtonElement;
   ons.BottomToolbarElement = BottomToolbarElement;
   ons.ButtonElement = ButtonElement;
   ons.CarouselItemElement = CarouselItemElement;
   ons.CarouselElement = CarouselElement;
   ons.ColElement = ColElement;
   ons.DialogElement = DialogElement;
   ons.FabElement = FabElement;
   ons.GestureDetectorElement = GestureDetectorElement;
   ons.IconElement = IconElement;
   ons.LazyRepeatElement = LazyRepeatElement;
   ons.ListHeaderElement = ListHeaderElement;
   ons.ListItemElement = ListItemElement;
   ons.ListElement = ListElement;
   ons.InputElement = InputElement;
   ons.ModalElement = ModalElement;
   ons.NavigatorElement = NavigatorElement;
   ons.PageElement = PageElement;
   ons.PopoverElement = PopoverElement;
   ons.ProgressBarElement = ProgressBarElement;
   ons.ProgressCircularElement = ProgressCircularElement;
   ons.PullHookElement = PullHookElement;
   ons.RippleElement = RippleElement;
   ons.RowElement = RowElement;
   ons.SpeedDialItemElement = SpeedDialItemElement;
   ons.SpeedDialElement = SpeedDialElement;
   ons.SplitterContentElement = SplitterContentElement;
   ons.SplitterMaskElement = SplitterMaskElement;
   ons.SplitterSideElement = SplitterSideElement;
   ons.SplitterElement = SplitterElement;
   ons.SwitchElement = SwitchElement;
   ons.TabElement = TabElement;
   ons.TabbarElement = TabbarElement;
   ons.ToolbarButtonElement = ToolbarButtonElement;
   ons.ToolbarElement = ToolbarElement;
   ons.RangeElement = RangeElement;

   window.addEventListener('load', function () {
     ons.fastClick = FastClick.attach(document.body);
   }, false);

   window.addEventListener('DOMContentLoaded', function () {
     ons._deviceBackButtonDispatcher.enable();
     ons._defaultDeviceBackButtonHandler = ons._deviceBackButtonDispatcher.createHandler(window.document.body, function () {
       navigator.app.exitApp();
     });
     document.body._gestureDetector = new ons.GestureDetector(document.body);
   }, false);

   ons.ready(function () {
     ons._setupLoadingPlaceHolders();
   });

   new Viewport().setup();

   return ons;
} ));

