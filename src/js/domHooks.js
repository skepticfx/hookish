var domHooks = {


  dom_text_node_mutation: function() {
    console.log('Enabling dom_text_node_mutation Mutation Observer. Things can become a little slow!');
    var mutationConfig = {
      characterData: true,
      subtree: true
    };
    var domTextNodeObserver = new MutationObserver(handleMutation);
    domTextNodeObserver.observe(document, mutationConfig);

    function handleMutation(mutations) {
      console.log("FROM !!! ! HOOKISH MUTATION OBSERVER");
      console.warn(mutations);

      mutations.forEach(function(mutation) {
        if (mutation.type === 'characterData') { // Only observing textNode like changes for now.
          var mutatedTargetValue = mutation.target.nodeValue;
          track.customHook.add(new Object({
            'type': 'sink',
            'data': mutatedTargetValue,
            meta: ''
          }), 'dom_text_node_mutation')
        };
      });
    }
  },

  document_location_hash: function() {
    var original_document_location_hash = document.location.hash;
    Object.defineProperty(document.location, "hash", {
      get: function() {
        track.customHook.add(new Object({
          'type': 'source',
          'data': original_document_location_hash,
          'meta': functionCallTracer()
        }), 'document_location_hash');
        return original_document_location_hash;
      }
    });
  },

  document_referrer: function() {
    var original_document_referrer = document.referrer;
    Object.defineProperty(document, "referrer", {
      get: function() {
        track.customHook.add(new Object({
          'type': 'source',
          'data': original_document_referrer,
          'meta': functionCallTracer()
        }), 'document_referrer');
        return original_document_referrer;
      }
    });
  },

  document_cookie: function() {
    var original_document_cookie = document.cookie;
    Object.defineProperty(document, "cookie", {
      get: function() {
          track.customHook.add(new Object({
            'type': 'source',
            'data': original_document_cookie,
            'meta': functionCallTracer()
          }), 'document_cookie');
          return original_document_cookie;
        }
        // TODO: FIXME - Define the setter for Cookies.
        // https://github.com/skepticfx/hookish/issues/2
    });
  },

  window_eval: function() {
    var original_window_eval = window.eval;
    window.eval = function() {
      track.customHook.add(new Object({
        'type': 'sink',
        'data': arguments[0],
        'meta': functionCallTracer()
      }), 'window_eval');
      return original_window_eval.apply(this, arguments);
    }
  },
  document_write: function() {
    var original_document_write = document.write;
    document.write = function() {
      track.customHook.add(new Object({
        'type': 'sink',
        'data': arguments[0],
        'meta': functionCallTracer()
      }), 'document_write');
      return original_document_write.apply(this, arguments);
    }
  },
  window_setTimeout: function() {
    var original_window_setTimeout = window.setTimeout;
    window.setTimeout = function() {
      track.customHook.add(new Object({
        'type': 'sink',
        'data': arguments[0].toString(),
        'meta': functionCallTracer()
      }), 'window_setTimeout');
      return original_window_setTimeout.apply(this, arguments)
    }
  },
  window_setInterval: function() {
    var original_window_setInterval = window.setInterval;
    window.setInterval = function() {
      track.customHook.add(new Object({
        'type': 'sink',
        'data': arguments[0].toString(),
        'meta': functionCallTracer()
      }), 'window_setInterval');
      return original_window_setInterval.apply(this, arguments)
    }
  },

  xhr: function() {
    xhook.enable();
    xhook.after(function(req, res) {
      console.log(req);
      console.log(res);
      // Lets tamper with the response
      resBody = res.text.toString().trim();
      if (resBody[0] === '{' && resBody[resBody.length - 1] === '}') {
        resBody = JSON.parse(resBody);
        Object.keys(resBody).forEach(function(key) {
          // HO_XHR_7827371 is the tainting value. We search for this in the haystack.
          resBody[key] = resBody[key] + "HO_XHR_7827371";
        })
        resBody = JSON.stringify(resBody);
        res.text = resBody.toString();
        console.log("Modified response: " + res.text)
      }
      track.xhr.add({ // need to add more OBJECTs!!
        method: req.method,
        url: req.url,
        reqBody: req.body
      });
    })
  },

  ws: function() {
    wsHook.onMessage = function(event) {
      console.log("ws recieved: " + event);
      track.ws.add({
        data: event.data,
        url: event.url,
        type: 'response' // onMessage from the server
      });
    }

    wsHook.onSend = function(event) {
      console.log("ws sent: " + event);
      track.ws.add({
        data: event.data,
        url: event.url,
        type: 'request' // onSend to the server
      });
    }
  },

  unsafeAnchors: function() {
    // https://hackerone.com/reports/23386
    var hookUnsafeAnchors = function() {
      console.log('Hooking into all Anchor tags to analyze them for unsafe usage of target="_blank"');
      var anchors = document.getElementsByTagName('a');
      // Convert HTMLCollection to Array
      anchors = [].slice.call(anchors);
      anchors.forEach(function(anchor) {
        if ('target' in anchor && anchor.target == '_blank') {
          var anchorCopy = anchor.cloneNode();
          var tmpNode = document.createElement("div");
          tmpNode.appendChild(anchorCopy);
          track.unsafeAnchors.add({
            href: anchor.href,
            target: anchor.target,
            hostname: anchor.hostname,
            string: tmpNode.innerHTML.toString()
          });
          delete tmpNode;
        }
      })
      console.log(anchors);
    }
    window.addEventListener("load", hookUnsafeAnchors, false);
  },

  init: function() {
    var original_document_domain = document.domain;
    var track = {};
    track.domain = original_document_domain; // How funny, we could have used a hooked value.
    track.href = document.location.href; // This cannot be hooked in browsers today.
    track.customHook = [];
    track.xhr = [];
    track.ws = [];
    track.unsafeAnchors = [];

    track.customHook.add = function(obj, nature) {
      track.customHook.push(obj);
      console.log(obj.type + " called with value " + obj.data.slice(0, 100));
      obj.name = nature;
      obj.domain = track.domain;
      obj.href = track.href;
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    }


    track.xhr.add = function(obj) {
      track.xhr.push(obj);
      console.log(obj.method + "  " + obj.url);
      obj.name = 'xhr';
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    }

    track.unsafeAnchors.add = function(obj) {
      track.unsafeAnchors.push(obj);
      obj.name = 'unsafeAnchors';
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    }

    track.ws.add = function(obj) {
      track.ws.push(obj);
      console.log(obj.url + "  " + obj.data + " " + obj.type);
      obj.name = 'ws';
      window.postMessage({
        type: "FROM_HOOKISH",
        'obj': obj
      }, "*");
    }

  }

}