chrome.storage.local.get(null, function(db) {
  if (db.state == true && document.domain.search(db.domain) != -1) {
    console.log('Injecting Hookish! hooks.');
    var injectString = [];
    var settings = db.settings;
    var hookSettings = settings.hooks;
    var settingNames = Object.keys(hookSettings);

    /** Da real Hooking happens here
     *  1. Load required libraries to inject from libsToinject.js
     *  2. Hookish specific code like callTracer, homHook initialization etc.
     *  3. Insert the required DomHooks depending upon the enabled values in 'settings.hooks'
     *  TODO: Need to check that a library is not inserted already.
     */
    settingNames.forEach(function(settingName) {
      var hookSetting = hookSettings[settingName];
      // Insert the required libraries if any.
      if (hookSetting.enabled && hookSetting.libToInject) {
        injectString.push(libsToInject[hookSetting.libToInject]);
      }
    });


    // The Function Call Tracer.
    injectString.push(libsToInject.functionCallTracer);
    // Tracking variables
    injectString.push(domHooks.init);

    settingNames.forEach(function(settingName) {
      var hookSetting = hookSettings[settingName];
      if (hookSetting.enabled) {
        // Insert the respective Dom Hook.
        injectString.push(domHooks[settingName]);
      }
    });

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

    window.addEventListener("message", function(event) {
      if (event.source !== window) return;
      if (event.data.type && event.data.type === "FROM_HOOKISH") {
        var incoming = event.data.obj;
        if (incoming.meta === "LIBRARY") return;
        var hookName = incoming.name;
        var currentHooksinDB = db.hooks[hookName];
        for (hook in currentHooksinDB) {
          // Ignore if the incoming hook is already present in 'db.hooks'.
          if (JSON.stringify(hook) == JSON.stringify(incoming)) {
            console.warn("An incoming " + hookName + " hook is not inserted");
            return;
          }
        }
        db.hooks[hookName].push(incoming);
        chrome.storage.local.set({
          hooks: db.hooks
        });
      }
    }, false);


  }
});


function injectScript(scriptString) {
  var actualCode = '(function(){' + scriptString + '})();'
  var script = document.createElement('script');
  script.textContent = actualCode;
  (document.head || document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);
}


/*

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
*/