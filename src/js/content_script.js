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
        console.log(incoming.name);
        console.log(incoming.data);
        if (isEmptyHook(db, incoming)) {
          console.log('Ignored storing an empty incoming data.');
          return;
        }
        var currentHooksInDb = db.hooks[hookName];
        var isDuplicate;
        currentHooksInDb.forEach(function(currentHook) {
          isDuplicate = false;
          // Ignore if the incoming hook is already present in 'db.hooks'.
          if (isDuplicateHook(currentHook, incoming)) {
            console.warn("An incoming " + hookName + " hook was not inserted. Because it was a duplicate.");
            isDuplicate = true;
            return;
          }
        });
        if (!isDuplicate) {
          db.hooks[hookName].push(incoming);
          chrome.storage.local.set({
            hooks: db.hooks
          });
        }
      }
    }, false);


  }
});


function isEmptyHook(db, incoming){
  return (db.settings.preferences.ignoreEmptyValues.enabled === true && incoming.data !== undefined && incoming.data !== null && incoming.data.toString().trim().length === 0);
}

function isDuplicateHook(hook, incoming) {

  // For sources and sinks types.
  // TODO: Add meta data comparison
  if (incoming.type === 'source' || incoming.type === 'sink') {
    var hookData = hook.data.toString().trim();
    var incomingData = incoming.data.toString().trim();

    var hookType = hook.type;
    var incomingType = incoming.type;
    if (hookData === incomingData && hookType === incomingType)
      return true;
  }

  return false;
}

function injectScript(scriptString) {
  var actualCode = '(function(){' + scriptString + '})();'
  var script = document.createElement('script');
  script.textContent = actualCode;
  (document.head || document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);
}

