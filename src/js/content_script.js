chrome.storage.local.get(null, function(db) {
  if (db.state == true && document.domain.search(db.domain) != -1) {
    console.log('Injecting Hookish! hooks.');
    var injectString = [];
    var domSettings = db.dom.settings;

    // The Function Call Tracer.
    injectString.push(libsToInject.functionCallTracer);

    // Load required libraries to inject
    if (domSettings.xhr.enabled) {
      injectString.push(libsToInject.xhook);
    }
    if (domSettings.ws.enabled) {
      injectString.push(libsToInject.wshook);
    }

    // Tracking variables
    injectString.push(domHooks.init);

    // Sources
    if (domSettings.sources.document_location_hash)
      injectString.push(domHooks.sources.document_location_hash);
    if (domSettings.sources.document_cookie)
      injectString.push(domHooks.sources.document_cookie);

    // Sinks
    var sinks = ['window_eval', 'document_write', 'window_setTimeout', 'window_setInterval'];
    sinks.forEach(function(sink){
      if(domSettings.sinks[sink])
        injectString.push(domHooks.sinks[sink]);
    });

    // xhook
    if (domSettings.xhr.enabled) {
      injectString.push(domHooks.xhook);
    }

    // wshook
    if (domSettings.ws.enabled) {
      injectString.push(domHooks.wshook);
    }

    // unsafeAnchors
    if (domSettings.unsafeAnchors.enabled) {
      injectString.push(domHooks.unsafeAnchors);
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
        switch (incoming.nature) {
          case 'xhr':
            db = trackXHR(incoming, db); // What a return value hack. My bad!
            break;
          case 'ws':
            db = trackWS(incoming, db);
            break;
          case 'unsafeAnchors':
            db = trackUnsafeAnchors(incoming, db);
            break;
          default: // DOM sources and sinks
            if (db.dom.settings.ignoreEmptyValues == true && incoming.data.length == 0) return;
            if (incoming.meta === 'LIBRARY') return;
            //console.log(incoming);
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
    }, false);
  }
});

function trackXHR(incoming, db) {
  var xhrHooks = db.xhrHooks;
  for (hook in xhrHooks) {
    if (JSON.stringify(xhrHooks[hook]) == JSON.stringify(incoming)) {
      console.log('XHR Hook Not Inserted');
      return db;
    }
  }
  db.xhrHooks.push(incoming);
  chrome.storage.local.set({
    xhrHooks: xhrHooks
  });
  return db;
}


function trackWS(incoming, db) {
  var wsHooks = db.wsHooks;
  for (hook in wsHooks) {
    if (JSON.stringify(wsHooks[hook]) == JSON.stringify(incoming)) {
      console.log('WS Hook Not Inserted');
      return db;
    }
  }
  db.wsHooks.push(incoming);
  chrome.storage.local.set({
    wsHooks: wsHooks
  });
  return db;
}


function trackUnsafeAnchors(incoming, db) {
  // Only harness Cross domain hrefs, if the setting is enabled.
  if (db.dom.settings.unsafeAnchors.xdomain && incoming.hostname.endsWith(document.domain))
    return db;
  var unsafeAnchors = db.unsafeAnchors;
  for (anchor in unsafeAnchors) {
    if (JSON.stringify(unsafeAnchors[anchor]) == JSON.stringify(incoming)) {
      console.log('unsafeAnchors Not Inserted');
      return db;
    }
  }
  db.unsafeAnchors.push(incoming);
  chrome.storage.local.set({
    unsafeAnchors: unsafeAnchors
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