//console.log("Injecting stuff");

function injectScript(func) {
    var actualCode = '(' + func + ')();'
	var script = document.createElement('script');
	script.textContent = actualCode;
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}


//Helper Functions


// All hooking code goes here.
// BEWARE: Since the function is serialized, the original scope, and all bound properties are lost!
var scriptToInject = function() {

try{

	var stristr = function(haystack, needle, bool) {
		var pos = 0;

		haystack += '';
		pos = haystack.toLowerCase().indexOf((needle + '').toLowerCase());
		if (pos == -1) {
		return false;
		} else {
			if (bool) {
			  return haystack.substr(0, pos);
			} else {
			  return haystack.slice(pos);
			}
		}
	}		

	// Variables to maintain state and track our small AI logic.

	var find_;


	// Originals.
	var original_window_eval = window.eval;
	
	var original_document_location_hash = document.location.hash;
	var original_window_location_hash = window.location.hash;
	var original_location_hash = location.hash;
	
	var original_document_write = document.write;
	var original_document_domain = document.domain;

	var sendToBackground = function(obj, domain){
		obj.domain = domain;

	}
	
	// Tracking variables
	var track = {};
	track.domain = original_document_domain; // How funny, we could have used a hooked value.
	track.href = document.location.href; // This cannot be hooked in browsers today.
	track.sources = [];
	track.sinks = [];
	
	track.sources.add = function(obj){
		track.sources.push(obj);
		console.log(obj.type + " called with value "+obj.data.slice(0,100));
		obj.nature = 'source';		
		obj.domain = track.domain;
		obj.href = track.href;
		window.postMessage({type: "FROM_HOOKISH", 'obj': obj}, "*");
	}

	track.sinks.add = function(obj){
		track.sinks.push(obj);
		console.log(obj.type + " called with value "+obj.data.slice(0,100));
		obj.nature = 'sink';
		obj.domain = track.domain;
		obj.href = track.href;
		window.postMessage({type: "FROM_HOOKISH", 'obj': obj}, "*");
	}	
	
// All the Hooking goes here.
// We will be using ES6 Proxies in the future.
	// Properties are better handled this way.

	/*
 	All location.hash Hooks
	*	location.hash
	*	window.location.hash
	*	document.location.hash
	*	window.document.location.hash
	 */
	Object.defineProperty( document.location, "hash", {
		get: function(){ track.sources.add(new Object({'type': 'document.location.hash', 'data': original_document_location_hash})); return original_document_location_hash; }
	});
	
	//CHROME BUG: __lookupSetter__/__lookupGetter__ don't return native setters and getters  https://code.google.com/p/chromium/issues/detail?id=13175
	/*
	Object.defineProperty( document.body, "innerHTML", {
		get: function(){ return temp_document_innerHTML; },
		set: function(x){ console.log("document.body.innerHTML called"); track.sinks.push(x); temp_document_body_innerHTML = x; }
	});
	*/

	// Functions are better hooked, than Object.defineProperty
	window.eval = function(){ track.sinks.add(new Object({'type': 'eval', 'data': arguments[0]})); return original_window_eval.apply(this, arguments);}	

	document.write = function(x){ track.sinks.add(new Object({'type': 'document.write', 'data': arguments[0]})); return original_document_write.apply(this, arguments);}	

/* 	if(track.sources.length != 0){
		console.log("Sources :" + track.sources);
		console.log("Sinks :" +track.sinks);
		result = stristr(track.sources[0], track.sinks[0]);
		if(result){
			console.log("Possible DOM XSS");
		}
	} */

	// Comparing.	
	/*setTimeout(function(){
		console.log("Sources :" + track.sources);
		console.log("Sinks :" +track.sinks);
		console.log(track);
		
		localStorage.setItem('hookish_data', JSON.stringify(track));
		},2000);
*/
}

catch(e){
	console.log("ERROR:" + e);
}


} // End of Function - scriptToInject

// Write to File Stuff

injectScript(scriptToInject);

chrome.storage.local.get(null, function(db){
	window.addEventListener("message", function(event){
	  // We only accept messages from ourselves
	  if (event.source != window)
	    return;

	  if (event.data.type && (event.data.type == "FROM_HOOKISH")){
			var stats = db.stats;
			// insert only if domain matches the current filter.
			if(event.data.obj.domain.search(db.domain) != -1){
				// insert only if its not a duplicate
				stats.forEach(function(stat){
					if(JSON.stringify(stat) == JSON.stringify(event.data.obj));
					// DO not insert, PS: lots of optimizations possible
					console.log('Not inserted');
					return;
				});
				stats.push(event.data.obj);
				chrome.storage.local.set({'stats': stats});
	  	}
	  }
	}, false);
});



/*
https://developer.chrome.com/extensions/content_scripts.html#host-page-communication
In the above example, example.html (which is not a part of the extension) posts messages to itself, which are intercepted and inspected by the content script, and then posted to the extension process. In this way, the page establishes a line of communication to the extension process. The reverse is possible through similar means.
*/