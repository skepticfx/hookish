function injectScript(func) {
    var actualCode = '(' + func + ')();'
	var script = document.createElement('script');
	script.textContent = actualCode;
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}


// Write to File Stuff
chrome.storage.local.get(null, function(db){
	if(db.state == true && document.domain.search(db.domain) != -1){
		// good to inject
		console.log('Injecting Hookish! hooks.')
		injectScript(scriptToInject);
		var hooks = db.stats;

		window.addEventListener("message", function(event){
			if(event.source != window)	return;
			if(event.data.type && (event.data.type == "FROM_HOOKISH")){
				var incoming = event.data.obj;
				if(db.settings.domss_empty_values == true && incoming.data.length == 0)  return;
				// insert only if filter matches the current domain
				if(incoming.domain.search(db.domain) != -1){
					for(hook in hooks){
						if(JSON.stringify(hooks[hook]) == JSON.stringify(incoming)){
							console.log('Not Inserted');
							return;
						}
					}
					hooks.push(incoming);
					chrome.storage.local.set({'stats': hooks});
				}
			}
		}, false)

	}

	var domSettings = db.dom.settings;
	var injectString = [];

	// Tracking variables
	injectString.append(function(){
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
	})


	if(domSettings.sources.document_location_hash){
		injectString.append(function(){
			var original_document_location_hash = document.location.hash;

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
		}
	}

	var scriptStringToInject


		// All hooking code goes here.
		// BEWARE: Since the function is serialized, the original scope, and all bound properties are lost!
		var scriptToInject = function() {

		try{

			// Originals.
			var original_window_eval = window.eval;
			
			var original_window_location_hash = window.location.hash;
			
			var original_document_write = document.write;
			var original_document_domain = document.domain;

			
						
		// All the Hooking goes here.
		// We will be using ES6 Proxies in the future.
			// Properties are better handled this way.


			
			//CHROME BUG: __lookupSetter__/__lookupGetter__ don't return native setters and getters  https://code.google.com/p/chromium/issues/detail?id=13175
			/*
			Object.defineProperty( document.body, "innerHTML", {
				get: function(){ return temp_document_innerHTML; },
				set: function(x){ console.log("document.body.innerHTML called"); track.sinks.push(x); temp_document_body_innerHTML = x; }
			});
			*/

			// Functions are better hooked, with Object.defineProperty
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

});