chrome.storage.local.get(null, function(db) {
  if (db.state == true && document.domain.search(db.domain) != -1) {
    // good to inject
    console.log('Injecting Hookish! hooks.');
    var injectString = [];
    var domSettings = db.dom.settings;

    // Tracking variables
    injectString.push(function() {
      var original_document_domain = document.domain;
      var track = {};
      track.domain = original_document_domain; // How funny, we could have used a hooked value.
      track.href = document.location.href; // This cannot be hooked in browsers today.
      track.sources = [];
      track.sinks = [];

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
    })


    if (domSettings.sources.document_location_hash) {
      injectString.push(function() {
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
      });
    }


    if (domSettings.sinks.window_eval) {
      injectString.push(function() {
        var original_window_eval = window.eval;
        window.eval = function() {
          track.sinks.add(new Object({
            'type': 'eval',
            'data': arguments[0]
          }));
          return original_window_eval.apply(this, arguments);
        }
      })
    }
    if (domSettings.sinks.document_write) {
      injectString.push(function() {
        var original_document_write = document.write;
        document.write = function(x) {
          track.sinks.add(new Object({
            'type': 'document.write',
            'data': arguments[0]
          }));
          return original_document_write.apply(this, arguments);
        }
      })
    }

    // Generate the script to inject from the array of functions.
    var scriptToInject = "";
    injectString.forEach(function(func) {
      var func = func.toString().trim(); // get the function code
      func = func.replace(func.split('{', 1), ''); // remove the function(), part from the string.
      func = func.substr(1); // remove the {
      func = func.substr(0, func.length - 1); // remove the last } at the end.
      func = func + "\n"; // create a new line
      scriptToInject = scriptToInject + func;

    });


    injectScript(scriptToInject);
    var hooks = db.stats;

    window.addEventListener("message", function(event) {
      if (event.source != window) return;
      if (event.data.type && (event.data.type == "FROM_HOOKISH")) {
        var incoming = event.data.obj;
        if (db.settings.domss_empty_values == true && incoming.data.length == 0) return;
        // insert only if filter matches the current domain
        if (incoming.domain.search(db.domain) != -1) {
          for (hook in hooks) {
            if (JSON.stringify(hooks[hook]) == JSON.stringify(incoming)) {
              console.log('Not Inserted');
              return;
            }
          }
          hooks.push(incoming);
          chrome.storage.local.set({
            'stats': hooks
          });
        }
      }
    }, false)

  }
});


function injectScript(scriptString) {
  var actualCode = '(function(){' + scriptString + '})();'
  var script = document.createElement('script');
  script.textContent = actualCode;
  (document.head || document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);
}