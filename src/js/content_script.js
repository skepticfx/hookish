chrome.storage.local.get(null, function(db) {
  if (db.state == true && document.domain.search(db.domain) != -1) {
    console.log('Injecting Hookish! hooks.');
    var injectString = [];
    var domSettings = db.dom.settings;

    // Load required libraries to inject
    if (domSettings.xhr.enabled) {
      injectString.push(libsToInject.xhook);
    }

    // Tracking variables
    injectString.push(domHooks.init);

    // Sources
    if (domSettings.sources.document_location_hash)
      injectString.push(domHooks.sources.document_location_hash);

    // Sinks
    if (domSettings.sinks.window_eval)
      injectString.push(domHooks.sinks.window_eval);
    if (domSettings.sinks.document_write)
      injectString.push(domHooks.sinks.document_write);

    // xhook
    if (domSettings.xhr.enabled) {
      injectString.push(domHooks.xhook);
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
        if (incoming.nature == 'xhr') {
          db = trackXHR(incoming, db); // What a return value hack. My bad!
        } else {
          if (db.dom.settings.ignoreEmptyValues == true && incoming.data.length == 0) return;
          // insert only if filter matches the current domain
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

function trackXHR(hook, db) {
  var xhrHooks = db.xhrHooks;
  for (hook in xhrHooks) {
    if (JSON.stringify(xhrHooks[hook]) == JSON.stringify(incoming)) {
      console.log('XHR Hook Not Inserted');
      return;
    }
  }
  db.xhrHooks.push(hook);
  chrome.storage.local.set({
    xhrHooks: xhrHooks
  });
  return db;
}


function injectScript(scriptString) {
  var actualCode = '(function(){' + scriptString + '})();'
  var script = document.createElement('script');
  script.textContent = actualCode;
  (document.head || document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);
}