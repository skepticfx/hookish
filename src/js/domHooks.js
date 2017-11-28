var domHooks = {

  init: function() {

    var Taints = {};
    var HOOKISH_TAG = "34758";
    var Originals = {};

    // Add these to all possible sources and track them in all possible sinks.
    Taints.XHR_JSON_RESPONSE = HOOKISH_TAG + "_XHR_JSON_RES";
    Taints.XHR_RESPONSE = HOOKISH_TAG + "_XHR_RES";
    Taints.DOCUMENT_REFERRER = HOOKISH_TAG + "_DOC_REFERRER";
    Taints.WINDOW_NAME = HOOKISH_TAG + "_WIN_NAME";
    Taints.DOCUMENT_COOKIE = HOOKISH_TAG + "_DOC_COOKIE";


    var original_document_domain = document.domain;
    var track = {};
    track.domain = original_document_domain; // Irony Detected!-
    track.href = document.location.href; // This cannot be hooked in browsers today.
    track.customHook = [];
    track.xhr = [];
    track.ws = [];
    track.unsafeAnchors = [];

    track.customHook.add = function(obj, nature) {
      track.customHook.push(obj);
      console.log(obj, nature)
      if (obj.data && obj.data.length >= 0)
        console.log(obj.type + " called with value " + obj.data.slice(0, 100));
      obj.name = nature.toString();
      obj.domain = track.domain;
      obj.href = track.href;
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    };


    track.xhr.add = function(obj) {
      track.xhr.push(obj);
      console.log(obj.method + "  " + obj.url);
      obj.name = 'xhr';
      obj.section = 'xhr';
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    };

    track.unsafeAnchors.add = function(obj) {
      track.unsafeAnchors.push(obj);
      obj.name = 'unsafeAnchors';
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    };

    track.ws.add = function(obj) {
      track.ws.push(obj);
      console.log(obj.url + "  " + obj.data + " " + obj.type);
      obj.name = 'ws';
      obj.section = 'ws';
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    };

    setHookishTagSettings = function(data) {
      var settings = {};
      settings.tagged = false;
      settings.taintedClassName = '';
      // search the data for HOOKISH_TAGS from Taints.
      for (taintTag in Taints) {
        if (data.includes(Taints[taintTag])) {
          settings.tagged = true;
          settings.tagName = Taints[taintTag];
        }
      }
      return settings;
    }

    removeTagsForSetter = function(val, hookishTagSettings) {
      if (hookishTagSettings && hookishTagSettings.tagged === true) {
        // Remove our tags from the actual sink, if present.
        hookishTagSettings.taintedClassName = 'taintedSink';
        return val.replace(new RegExp(hookishTagSettings.tagName, "gi"), '');
      }
      return val;
    }

  },


  /**
   * Hooking Element.prototype.innerHTML
   * This will take care of all Node.innerHTML, Node.outerHTML etc.
   *
   * Getters & setters for Element.prototype: http://domstorm.skepticfx.com/modules/?id=55b00aaf34473500003d257d
   */

  dom_nodes: function() {
    console.log("Hooking DOM Nodes");
    var props = ['innerHTML', 'outerHTML'];

    props.forEach(function(prop) {
      var setter = Element.prototype.__lookupSetter__(prop);
      Object.defineProperty(Element.prototype, prop, {
        set: function() {
          var hookishTagSettings = setHookishTagSettings(arguments[0]);
          arguments[0] = removeTagsForSetter(arguments[0], hookishTagSettings);
          track.customHook.add(new Object({
            'type': 'sink',
            'data': arguments[0] || '',
            'nodeName': this.nodeName,
            'propertyName': prop,
            'fullName': this.nodeName + '.' + prop,
            'meta': functionCallTracer(),
            'section': 'sinks',
            'hookishTagSettings': hookishTagSettings
          }), 'dom_nodes');
          return setter.apply(this, arguments);
        }
      });

    });
  },

  /**
   * Chrome >43 has disabled accessor, mutator for document.location :(
   * Need to wait and see. ES6 Proxy ? No
   */

  document_location_hash: function() {
    var hash_setter = document.location.__lookupSetter__('hash');
    var hash_getter = document.location.__lookupGetter__('hash');
    Object.defineProperty(location, "hash", {
      get: function() {
        var h = hash_getter.apply(this, arguments);
        track.customHook.add(new Object({
          'type': 'source',
          'data': h,
          'section': 'sources',
          'meta': functionCallTracer()
        }), 'document_location_hash');
        return h;
      }
      /*
      ,
      set: function(val) {
        track.customHook.add(new Object({
          'type': 'sink',
          'data': val,
          'section': 'sinks',
          'meta': functionCallTracer()
        }), 'document_location_hash');
        return hash_getter.apply(this, arguments);
      }*/

    });
  },

  document_referrer: function() {
    var original_document_referrer = document.referrer;
    Object.defineProperty(document, "referrer", {
      get: function() {
        track.customHook.add(new Object({
          'type': 'source',
          'data': original_document_referrer,
          'section': 'sources',
          'meta': functionCallTracer()
        }), 'document_referrer');
        return original_document_referrer;
      }
    });
  },
  // window.name doesn't have the native __getter__ / __setter__
  window_name: function() {
    var global = {};
    global.current_window_name = window.name;
    Object.defineProperty(window, "name", {
      get: function() {
        current_window_name = global.current_window_name;
        track.customHook.add(new Object({
          'type': 'source',
          'data': current_window_name.toString(), // + Taints.WINDOW_NAME,
          'section': 'sources',
          'meta': functionCallTracer()
        }), 'window_name');
        return current_window_name;
      },

      set: function(val) {
        val = val.toString();
        global.current_window_name = val;
        track.customHook.add(new Object({
          'type': 'sink',
          'data': val,
          'section': 'sinks',
          'meta': functionCallTracer()
        }), 'window_name');
      }

    });
  },


  document_cookie: function() {
    var cookie_setter = document.__lookupSetter__('cookie');
    var cookie_getter = document.__lookupGetter__('cookie');
    Object.defineProperty(document, "cookie", {
      get: function() {
        var c = cookie_getter.apply(this, arguments);
        track.customHook.add(new Object({
          'type': 'source',
          'data': c,
          'section': 'sources',
          'meta': functionCallTracer()
        }), 'document_cookie');
        return c;
      },
      set: function(val) {
        track.customHook.add(new Object({
          'type': 'sink',
          'data': val,
          'section': 'sinks',
          'meta': functionCallTracer()
        }), 'document_cookie');
        return cookie_setter.apply(this, arguments);
      }

    });
  },

  window_eval: function() {
    var original_window_eval = window.eval;
    window.eval = function() {
      var hookishTagSettings = setHookishTagSettings(arguments[0]);
      arguments[0] = removeTagsForSetter(arguments[0], hookishTagSettings);
      track.customHook.add(new Object({
        'type': 'sink',
        'data': arguments[0] || '',
        'section': 'sinks',
        'meta': functionCallTracer(),
        'hookishTagSettings': hookishTagSettings
      }), 'window_eval');
      return original_window_eval.apply(this, arguments);
    }
  },
  document_write: function() {
    var original_document_write = document.write;
    document.write = function() {
      var hookishTagSettings = setHookishTagSettings(arguments[0]);
      arguments[0] = removeTagsForSetter(arguments[0], hookishTagSettings);
      track.customHook.add(new Object({
        'type': 'sink',
        'data': arguments[0] || '',
        'section': 'sinks',
        'meta': functionCallTracer(),
        'hookishTagSettings': hookishTagSettings
      }), 'document_write');
      return original_document_write.apply(this, arguments);
    }
  },
  window_setTimeout: function() {
    var original_window_setTimeout = window.setTimeout;
    window.setTimeout = function() {
      var hookishTagSettings = setHookishTagSettings(arguments[0]);
      arguments[0] = removeTagsForSetter(arguments[0], hookishTagSettings);
      track.customHook.add(new Object({
        'type': 'sink',
        'section': 'sinks',
        'data': arguments[0].toString() || '',
        'meta': functionCallTracer(),
        'hookishTagSettings': hookishTagSettings
      }), 'window_setTimeout');
      return original_window_setTimeout.apply(this, arguments)
    }
  },
  window_setInterval: function() {
    var original_window_setInterval = window.setInterval;
    window.setInterval = function() {
      var hookishTagSettings = setHookishTagSettings(arguments[0]);
      arguments[0] = removeTagsForSetter(arguments[0], hookishTagSettings);
      track.customHook.add(new Object({
        'type': 'sink',
        'section': 'sinks',
        'data': arguments[0].toString() || '',
        'meta': functionCallTracer(),
        'hookishTagSettings': hookishTagSettings
      }), 'window_setInterval');
      return original_window_setInterval.apply(this, arguments)
    }
  },
  /*
    xhr: function() {
      xhook.enable();
      xhook.after(function(req, res) {
        console.log(req);
        console.log(res);

        var resBody = res.text.toString().trim();

        // **XHR_JSON_RES** - Taint every key-values in JSON response. Will be removed after found in a sink.
        // Others will remain, which may break flow of the actual app.
        if (resBody[0] === '{' && resBody[resBody.length - 1] === '}') {
          resBody = JSON.parse(resBody);
          Object.keys(resBody).forEach(function(key) {
            // Tainting all the values of a JSON XHR Response.
            resBody[key] = resBody[key] + Taints.XHR_JSON_RESPONSE;
          });
          resBody = JSON.stringify(resBody);
        } else {
          // Non-JSON response. Append taint to the end of string.
          resBody = resBody.toString() + Taints.XHR_RESPONSE;
        }

        res.text = resBody.toString();
        console.log("Modified response: " + res.text);

        track.xhr.add({ // need to add more OBJECTs!!
          method: req.method,
          url: req.url,
          reqBody: req.body
        });
      })
    },
  */

  xhr: function() {
    xhook.enable();
    xhook.after(function(req, res) {
      console.log(req);
      console.log(res);

      track.xhr.add({ // need to add more OBJECTs!!
        method: req.method,
        url: req.url,
        reqBody: req.body
      });
    })
  },

  ws: function() {
    wsHook.after = function(event, url) {
      console.log("ws recieved: " + event);
      track.ws.add({
        data: event.data,
        url: url,
        type: 'response' // onMessage from the server
      });
    };

    wsHook.before = function(data, url) {
      console.log("ws sent: " + event);
      track.ws.add({
        data: data,
        url: url,
        type: 'request' // onSend to the server
      });
    };
  },

  dom_text_node_mutation: function() {
    console.log('Enabling dom_text_node_mutation Mutation Observer. Things can become a little slow!');
    var mutationConfig = {
      characterData: true,
      subtree: true
    };
    var domTextNodeObserver = new MutationObserver(handleMutation);
    domTextNodeObserver.observe(document, mutationConfig);

    function handleMutation(mutations) {
      console.log("FROM !!! ! HOOKISH MUTATION OBSERVER");
      console.warn(mutations);

      mutations.forEach(function(mutation) {
        if (mutation.type === 'characterData') { // Only observing textNode like changes for now.
          var mutatedTargetValue = mutation.target.nodeValue;
          track.customHook.add(new Object({
            'type': 'sink',
            'data': mutatedTargetValue,
            meta: '',
            'section': 'sinks'
          }), 'dom_text_node_mutation')
        };
      });
    }
  },

  unsafeAnchors: function() {
    // https://hackerone.com/reports/23386
    var hookUnsafeAnchors = function() {
      console.log('Hooking into all Anchor tags to analyze them for unsafe usage of target="_blank"');
      var anchors = document.getElementsByTagName('a');
      // Convert HTMLCollection to Array
      anchors = [].slice.call(anchors);
      anchors.forEach(function(anchor) {
        //TODO: Does list only cross-domain now. Need to add a preference
        if ('target' in anchor && anchor.target == '_blank' && anchor.rel !== 'noreferrer') {
          var anchorCopy = anchor.cloneNode();
          var tmpNode = document.createElement("div");
          tmpNode.appendChild(anchorCopy);
          track.unsafeAnchors.add({
            href: anchor.href,
            target: anchor.target,
            hostname: anchor.hostname,
            string: tmpNode.innerHTML.toString(),
            section: 'unsafeAnchors'
          });
          delete tmpNode;
        }
      });
      //console.log(anchors);
    }
    window.addEventListener("load", hookUnsafeAnchors, false);
  },

  globalVariables: function() {
    // Fetch this very late.
    window.onload = function() {
      var globals = [];
      for (var b in window) {
        // Blacklist
        // window.closed is a global boolean exposed in Chrome.
        if (["closed", "name", "webkitStorageInfo", "webkitIndexedDB"].indexOf(b) !== -1) continue;
        if (window.hasOwnProperty(b) && typeof window[b] == "boolean") {
          globals.push(b);
        }
      }
      console.log("Collecting globally exposed variables");
      globals.forEach(function(global) {
        track.customHook.add(new Object({
          'type': 'list',
          'data': global,
          'section': 'none'
        }), 'globalVariables');
      })

    }
  },

  jsScripts: function() {
    // Fetch this very late.
    document.addEventListener("DOMContentLoaded", function() {
      var scripts = [].slice.call(document.scripts)
        .map(function(url) {
          return url.src
        });

      console.log("Collecting JS Scripts");
      scripts.forEach(function(src) {
        track.customHook.add(new Object({
          'type': 'list',
          'data': src,
          'section': 'none'
        }), 'jsScripts');
      })

    });
  }

};