var domHooks = {
  sources: {
    document_location_hash: function() {
      var original_document_location_hash = document.location.hash;
      Object.defineProperty(document.location, "hash", {
        get: function() {
          track.sources.add(new Object({
            'type': 'document.location.hash',
            'data': original_document_location_hash
          }));
          return original_document_location_hash;
        }
      });
    }
  },

  sinks: {
    window_eval: function() {
      var original_window_eval = window.eval;
      window.eval = function() {
        track.sinks.add(new Object({
          'type': 'eval',
          'data': arguments[0]
        }));
        return original_window_eval.apply(this, arguments);
      }
    },
    document_write: function() {
      var original_document_write = document.write;
      document.write = function() {
        track.sinks.add(new Object({
          'type': 'document.write',
          'data': arguments[0]
        }));
        return original_document_write.apply(this, arguments);
      }
    },
    window_setTimeout: function() {
      var original_window_setTimeout = window.setTimeout;
      window.setTimeout = function() {
        track.sinks.add(new Object({
          'type': 'setTimeout',
          'data': arguments[0].toString()
        }));
        return original_window_setTimeout.apply(this, arguments)
      }
    },
    window_setInterval: function() {
      var original_window_setInterval = window.setInterval;
      window.setInterval = function() {
        track.sinks.add(new Object({
          'type': 'setInterval',
          'data': arguments[0].toString()
        }));
        return original_window_setInterval.apply(this, arguments)
      }
    }
  },

  xhook: function() {
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

  wshook: function() {
    wsHook.onMessage = function(event) {
      console.log("ws recieved: " + event);
      track.ws.add({
        data: event.data,
        url: event.url,
        type: 'response' // onMessage from the server
      });
    }

    wsHook.onSend = function(event) {
      console.log("ws sent: " + event);
      track.ws.add({
        data: event.data,
        url: event.url,
        type: 'request' // onSend to the server
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
        if ('target' in anchor && anchor.target == '_blank') {
          var tmpNode = document.createElement("div");
          tmpNode.appendChild(anchor);
          track.unsafeAnchors.add({
            href: anchor.href,
            target: anchor.target,
            hostname: anchor.hostname,
            string: tmpNode.innerHTML.toString()
          });
          delete tmpNode;
        }
      })
      console.log(anchors);
    }
    window.addEventListener("load", hookUnsafeAnchors, false);
  },

  init: function() {
    var original_document_domain = document.domain;
    var track = {};
    track.domain = original_document_domain; // How funny, we could have used a hooked value.
    track.href = document.location.href; // This cannot be hooked in browsers today.
    track.sources = [];
    track.sinks = [];
    track.xhr = [];
    track.ws = [];
    track.unsafeAnchors = [];

    track.sources.add = function(obj) {
      track.sources.push(obj);
      console.log(obj.type + " called with value " + obj.data.slice(0, 100));
      obj.nature = 'source';
      obj.domain = track.domain;
      obj.href = track.href;
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    }

    track.sinks.add = function(obj) {
      track.sinks.push(obj);
      console.log(obj.type + " called with value " + obj.data.toString().slice(0, 100));
      obj.nature = 'sink';
      obj.domain = track.domain;
      obj.href = track.href;
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    }

    track.xhr.add = function(obj) {
      track.xhr.push(obj);
      console.log(obj.method + "  " + obj.url);
      obj.nature = 'xhr';
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    }

    track.unsafeAnchors.add = function(obj) {
      track.unsafeAnchors.push(obj);
      obj.nature = 'unsafeAnchors';
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    }

    track.ws.add = function(obj) {
      track.ws.push(obj);
      console.log(obj.url + "  " + obj.data + " " + obj.type);
      obj.nature = 'ws';
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    }

  }

}