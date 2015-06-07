// XHR responses are tainted with HO_XHR_7827371.
function xhr2DomNodes() {

  chrome.storage.local.get("hooks", function(obj) {
    var domNodes = obj.hooks.dom_text_node_mutation;
    domNodes.forEach(function(domNode) {
      if (domNode.data.includes("HO_XHR_7827371")) {
        console.log("Possible DOM XSS!!!");
      }
    })
  })

}