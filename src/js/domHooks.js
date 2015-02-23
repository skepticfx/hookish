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
      document.write = function(x) {
        track.sinks.add(new Object({
          'type': 'document.write',
          'data': arguments[0]
        }));
        return original_document_write.apply(this, arguments);
      }
    }
  },

  xhook: function() {
    xhook.enable();
    xhook.after(function(req, res) {
      //console.log(req, res);
      track.xhr.add({ // need to add more OBJECTs!!
        method: req.method,
        url: req.url,
        reqBody: req.body
      });
    })
  },

  init: function() {
    var original_document_domain = document.domain;
    var track = {};
    track.domain = original_document_domain; // How funny, we could have used a hooked value.
    track.href = document.location.href; // This cannot be hooked in browsers today.
    track.sources = [];
    track.sinks = [];
    track.xhr = [];

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
      console.log(obj.type + " called with value " + obj.data.slice(0, 100));
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

  }

}