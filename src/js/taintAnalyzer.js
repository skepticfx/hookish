var Taints = {};
var HOOKISH_TAG = "34758";
Taints.XHR_JSON_RESPONSE = HOOKISH_TAG + "_XHR_JSON_RES";
Taints.XHR_RESPONSE = HOOKISH_TAG + "_XHR_RES";


function getTaintName(tag) {
  for (x in Taints) {
    if (tag === Taints[x]) {
      return x;
    }
  }
  console.warn("Error finding Taint Name");
  return "!! Error finding tagName";
}

function analyzeDomNodes() {
  chrome.storage.local.get("hooks", function(obj) {
    var domNodes = obj.hooks.dom_nodes;
    domNodes.forEach(function(domNode) {
      if (domNode.hookishTagSettings.tagged === true) {
        console.log(getTaintName(domNode.hookishTagSettings.tagName) + " flows into a " + domNode.nodeName + "." + domNode.propertyName);
        console.log(domNode.meta)
      }
    })
  })

}

/**
 * Finds the flows between DOM nodes from db.hooks
 *
 * For every element in source, find the flows that leads to sinks.
 *
 * @param sources
 * @param sinks
 * @returns {Array}


function identifyDomFlows(sources, sinks) {
  if (sources instanceof Array && sinks instanceof Array) return [];
  var results = [];
  sources.forEach(function(source) {
    sinks.forEach(function(sink) {
      var result = findSourceToSink(source, sink);
      if (result !== null) results.push(result);
    });
  });

  //return results;
}


function findSourceToSink(source, sink) {
  chrome.storage.local.get("hooks", function(obj) {
    var hooks = obj.hooks;
    alert(source, sink)

  });
}
 */

function identifyDomFlows(sources, sinks) {
  sinks.forEach(function(sink) {
    chrome.storage.local.get("hooks", function(db) {
      var hooks = db.hooks;
      hooks[sink].forEach(function(hookObject) {
        if (hookObject.hookishTagSettings && hookObject.hookishTagSettings.tagged === true) {
          alert(getTaintName(hookObject.hookishTagSettings.tagName) + " flows into  " + sink);
          console.log(hookObject.meta.split("\n")[0].trim().slice(2));
        }
      })
    })
  })

}