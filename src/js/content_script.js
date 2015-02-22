alert(domHooks);
chrome.storage.local.get(null, function(db) {
  if (db.state == true && document.domain.search(db.domain) != -1) {
    // good to inject
    console.log('Injecting Hookish! hooks.');
    var injectString = [];
    var domSettings = db.dom.settings;

    // Tracking variables
    injectString.push(domHooks.init);

    if (domSettings.sources.document_location_hash)
      injectString.push(domHooks.sources.document_location_hash);


    if (domSettings.sinks.window_eval)
      injectString.push(domHooks.sinks.window_eval);

    if (domSettings.sinks.document_write)
      injectString.push(domHooks.sinks.document_write);

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