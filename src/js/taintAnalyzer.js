
var Taints = {};
var HOOKISH_TAG = "34758";
Taints.XHR_JSON_RESPONSE = HOOKISH_TAG + "_XHR_JSON_RES";


function getTaintName(tag){
  for(x in Taints){
    if(tag === Taints[x]) {
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
        console.log(getTaintName(domNode.hookishTagSettings.tagName) + " flows into a " + domNode.nodeName+"." + domNode.propertyName);
        console.log(domNode.meta)
      }
    })
  })

}