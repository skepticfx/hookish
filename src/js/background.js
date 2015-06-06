// BootStrap
// NOT_STARTED -> STARTED -> RUNNING -> CLOSED -> NOT_STARTED
var devMode = false;
var globalState = false;
if (chrome.runtime.getManifest().update_url == null) {
  devMode = true;
  globalState = true;
  window.onerror = function(err) {
    alert("Some error occured: " + err);
  }

  chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
      console.log("This is a first install!");
      chrome.tabs.create({
        url: "index.html"
      });
    } else if (details.reason == "update") {
      var thisVersion = chrome.runtime.getManifest().version;
      console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
      chrome.tabs.create({
        url: "index2.html"
      });
    }
  });

}



var HOME_STATE = 'CLOSED';
var homeTab = "";
var homeWindow = "";

chrome.storage.local.get(null, function(db) {
  // The extension has been restarted.
  // Reset all


  chrome.storage.local.set({
    state: globalState,
    hooks: {
      document_location_hash: [],
      document_cookie: [],
      window_eval: [],
      document_write: [],
      window_setTimeout: [],
      window_setInterval: [],
      xhr: [],
      ws: [],
      unsafeAnchors: []
    },

    xhrHooks: [],
    wsHooks: [],
    stats: [],
    unsafeAnchors: [],

    settings: {
      // Everything that will be hooked
      hooks: {
        document_location_hash: {
          enabled: true
        },
        document_cookie: {
          enabled: true
        },
        window_eval: {
          enabled: true
        },
        document_write: {
          enabled: true
        },
        window_setTimeout: {
          enabled: false
        },
        window_setInterval: {
          enabled: false
        },
        xhr: {
          enabled: true,
          libToInject: "xhook"
        },
        ws: {
          enabled: true,
          libToInject: "wshook"
        },
        unsafeAnchors: {
          enabled: true,
          xdomain: true
        }
      },
      'ignoreEmptyValues': false
    }

  });

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