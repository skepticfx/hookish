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
        url: "index.html"
      });
    }
  });

}

var initializedDB = {
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
        enabled: true,
        description: 'Hook location.hash',
        section: 'sources'
      },
      document_cookie: {
        enabled: true,
        description: 'Hook document.cookie',
        section: 'sources'
      },
      window_eval: {
        enabled: true,
        description: 'Hook eval calls',
        section: 'sinks'
      },
      document_write: {
        enabled: true,
        description: 'Hook document.write',
        section: 'sinks'
      },
      window_setTimeout: {
        enabled: false,
        description: 'Hook setTimeout',
        section: 'sinks'
      },
      window_setInterval: {
        enabled: false,
        description: 'Hook setInterval',
        section: 'sinks'
      },
      xhr: {
        enabled: true,
        description: 'Hook XMLHttpRequests',
        libToInject: "xhook",
        section: 'xhr'
      },
      ws: {
        enabled: true,
        description: 'Hook WebSockets',
        libToInject: "wshook",
        section: 'ws'
      },
      unsafeAnchors: {
        enabled: false,
        description: 'Hook anchor tags',
        xdomain: true,
        section: 'unsafeAnchors'
      }
    },
    preferences: {
      ignoreEmptyValues: {
        enabled: true,
        description: 'Ignore Sources and Sinks with empty values'
      }
    }
  },

  sections: {
    sources: {
      settingName: 'sources',
      displayName: 'Sources',
      tableHeadings: ['Name', 'Value', 'Location']
    },
    sinks: {
      settingName: 'sinks',
      displayName: 'Sinks',
      tableHeadings: ['Name', 'Value', 'Location']
    },
    xhr: {
      settingName: 'xhr',
      displayName: 'XMLHttpRequests',
      tableHeadings: ['Method', 'URL']
    },
    ws: {
      settingName: 'ws',
      displayName: 'WebSockets',
      tableHeadings: ['Type', 'Data']
    }

  }

};


var HOME_STATE = 'CLOSED';
var homeTab = "";
var homeWindow = "";
chrome.storage.local.get(null, function(db) {
  // The extension has been restarted.
  // Reset all

  chrome.storage.local.set(initializedDB);

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