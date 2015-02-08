// BootStrap
// NOT_STARTED -> STARTED -> RUNNING -> CLOSED -> NOT_STARTED

var HOME_STATE = 'CLOSED';
var homeTab = "";
var homeWindow = "";

var GLOBAL = {};
var SETTINGS = {}



// All the hooks goes here.
GLOBAL.hooks = [];


//chrome.browserAction.setBadgeText({text: "10+"});
chrome.browserAction.setBadgeBackgroundColor({color: '#45c89f'});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
	if(HOME_STATE == 'CLOSED'){
		chrome.tabs.create({url: chrome.extension.getURL('awesome/index.html')}, function(tab){
			HOME_STATE = 'OPENED';
			homeTab = tab.id;
			homeWindow = tab.windowId;
			chrome.tabs.onRemoved.addListener(function(closedTab){
				if(homeTab == closedTab){
					HOME_STATE = 'CLOSED';}
			});
		});
	} else {
		chrome.windows.update(homeWindow, {focused: true});
		chrome.tabs.update(homeTab, {selected: true});
	}
});

// We have a message. Need to check performance.
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse){
	
	// Receiving the hooks.
	// All Requests from the Web Pages + Content Scripts
    if (typeof request.hooks !== 'undefined'){
      //console.log(request.hooks);
	  if(GLOBAL.IronWASP.enabled === true && GLOBAL.IronWASP.status == 'ALIVE')
			sendToIronWASP(request.hooks);
	  GLOBAL.hooks.push(request.hooks);
	}
	
	// IronWASP Queries
    if (typeof request.ironwasp !== 'undefined'){
		sendResponse(GLOBAL.IronWASP);
	}	
	
	// Data Queries
    if (typeof request.allData !== 'undefined'){
		sendResponse(GLOBAL.hooks);
	}	
	
	// Reset Data
    if (typeof request.resetData !== 'undefined'){
		GLOBAL.hooks = [];
		sendResponse(1);
	}		
});

}