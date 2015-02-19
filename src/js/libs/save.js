var data = [];
var jsonData = [];

// Text Ironwasp
document.getElementById('textButton').addEventListener('click', function(){
	this.innerText = "Hold on a moment !";
	chrome.runtime.sendMessage({'allData': '1'}, function(response){
		for(x in response){
			data.push(response[x].nature + " -  "+response[x].type + " called at " + response[x].href + " with value '" + response[x].data+ "' \r\n");
		}
		var blob = new Blob(data);
		saveAs(blob, "hookish" + ".txt");
		document.getElementById('textButton').innerText = "Download Text Format";		
	});
});

// JSON
document.getElementById('jsonButton').addEventListener('click', function(){
	this.innerText = "Hold on a moment !";
	chrome.runtime.sendMessage({'allData': '1'}, function(response){
		var json = "{'data': "+JSON.stringify(response) + "}";
		var blob = new Blob([json]);
		saveAs(blob, "hookish" + ".json");
		document.getElementById('jsonButton').innerText = "Download JSON Format";		
	});
});


// Reset Hook Data
document.getElementById('resetButton').addEventListener('click', function(){
	this.innerText = 'Resetting Hooked Data';
	chrome.runtime.sendMessage({'resetData': '1'}, function(response){
		alert('All hooked data have been reset.');
		document.getElementById('resetButton').innerText = 'Reset Hooked Data';
	});
});
document.body.onload = function(){
	chrome.runtime.sendMessage({'ironwasp': '1'}, function(response){
		if(response.enabled === true){
			refreshIronWASP(response.status);
		} else {
			var ironID = document.getElementById('ironwaspButton');
			ironID.innerHTML = 'IronWASP Logging is Disabled<br/><i>Click to tune the settings.';
			ironID.className = 'button styleError scrolly';
		}
	});
}



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	// If IronWASP is down.
	if(request.status !== 'undefined'){
		refreshIronWASP(request.status);
	}
});


function refreshIronWASP(status){
	var ironID = document.getElementById('ironwaspButton');
	if(status == 'DEAD'){
		ironID.className = 'button styleError scrolly';
		ironID.innerHTML = 'IronWASP Seems to be Down. If IronWASP is already running,<br/><i>Click to tune the settings.';
	} else {
		ironID.className = 'button style2 scrolly';
		ironID.innerHTML = 'IronWASP Seems to be Up and Logging our requests<br/><i>Click to tune the settings.';		
	}
}