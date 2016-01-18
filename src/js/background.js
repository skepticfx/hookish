// NOT_STARTED -> STARTED -> RUNNING -> CLOSED -> NOT_STARTED
var devMode = false;
var globalState = false;
var initDomain = 'damnvulnerable.me';

if (chrome.runtime.getManifest().update_url == null) {
  devMode = true;
  globalState = true;
  initDomain = 'localhost';
  window.onerror = function(err) {
    alert("Some error occured: " + err);
  }

}

chrome.runtime.onInstalled.addListener(function(details) {


  // Context Menu (Right-Click)
  var contexts = ["all"];
  var contextId = chrome.contextMenus.create({
    "id": "contextMenuStaticAnalysis",
    "title": 'Hookish! Static Analysis',
    "contexts": ["all"]
    },
    function(){
      console.log(chrome.runtime.lastError);
    }
  );
  chrome.contextMenus.onClicked.addListener(function(info, tabs){
    console.log(tabs);
    chrome.tabs.create({
      url: chrome.extension.getURL('staticAnalysis.html')
    });
  });


  if (details.reason == "install") {
    console.log("This is a first install!");
    chrome.tabs.create({
      url: "index.html"
    });
  } else if (details.reason == "update") {
    var thisVersion = chrome.runtime.getManifest().version;
    console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    chrome.tabs.create({
      url: "index.html"
    });
  }
});

initializedDB.state = globalState;
initializedDB.domain = initDomain;
chrome.storage.local.set(initializedDB);

var HOME_STATE = 'CLOSED';
var homeTab = "";
var homeWindow = "";
chrome.storage.local.get(null, function(db) {
  // The extension has been restarted.
  // Reset all

  chrome.browserAction.setBadgeBackgroundColor({
    color: '#45c89f'
  });

  // Called when the user clicks on the browser action.
  chrome.browserAction.onClicked.addListener(function(tab) {
    if (HOME_STATE == 'CLOSED') {
      chrome.tabs.create({
        url: chrome.extension.getURL('index.html')
      }, function(tab) {
        HOME_STATE = 'OPENED';
        homeTab = tab.id;
        homeWindow = tab.windowId;
        chrome.tabs.onRemoved.addListener(function(closedTab) {
          if (homeTab == closedTab) {
            HOME_STATE = 'CLOSED';
          }
        });
      });
    } else {
      chrome.windows.update(homeWindow, {
        focused: true
      });
      chrome.tabs.update(homeTab, {
        selected: true
      });
    }
  });

});