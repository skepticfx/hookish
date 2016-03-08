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
      "title": 'Hookish! Statically Analyse this page',
      "contexts": ["all"]
    },
    function() {
      console.log(chrome.runtime.lastError);
    }
  );



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


chrome.contextMenus.onClicked.addListener(function(info, tabs) {
  chrome.storage.local.get(null, function(db) {
    var getScriptSrcCode = "[].slice.call(document.scripts).filter(function(script){return script.src.length>0}).map(function(script) {return script.src})";
    chrome.tabs.executeScript(tabs.id, {
      code: getScriptSrcCode,
      runAt: 'document_end'
    }, function(scripts) {
      scripts = scripts[0];
      db.lastCollectedScripts = scripts;
      chrome.storage.local.set(db);
      chrome.tabs.create({
        url: chrome.extension.getURL('staticAnalysis.html')
      });
    });
  });
});