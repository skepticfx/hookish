$(function() {
  // Update the version info
  $('#version-info').text("v" + chrome.runtime.getManifest().version)
    // Setup toggle for all canToggle divs
  $('.canToggle').click(function() {
      $(this).parent().find('.toggleMe').slideToggle();
    })
    // Bootstrap switch
  chrome.storage.local.get(null, function(db) {
    console.log(db)
    $('#status').bootstrapSwitch('state', db.state);
    if (db.state) $('#domain').html(db.domain);
    $('#status').on('switchChange.bootstrapSwitch', function(event, state) {
      if (state == true) {
        bootbox.prompt({
          title: 'Enter the domain you want to run Hookish! (Eg: github.com)',
          value: db.domain,
          callback: function(domain) {
            if (domain != null && domain.length > 0) {
              db.state = true;
              db.domain = domain;
              chrome.storage.local.set(db);

              $('#domain').html(domain);
              setTimeout(function() {
                  location.reload()
                }, 200)
                // clear table
            } else {
              $('#status').bootstrapSwitch('state', false);
              $('#domain').html('');
              return;
            }
          }
        });
      } else {
        db.state = false;
        db.stats = [];
        chrome.storage.local.set(db);
        $('#domain').html('');

        // need to update table,
      }
    });


    // Add stackTrace wherever applicable

    $('tbody').on('click', '.callStack', function() {

      console.log($(this).data('callstack'));
    })

    // DOM Sources & Sinks
    var stats = db.stats;
    if (stats.length < 1) {
      $('#domssTableBody').append('<tr><td id="noDomssStats" colspan=4>No stats collected yet!</td></tr>');
    } else {
      stats.forEach(function(stat) {
        Utils.addToDomssTable(stat);
      });
    }

    // XHR
    var xhrHooks = db.xhrHooks;
    if (xhrHooks.length < 1) {
      $('#xhrTableBody').append('<tr><td id="noXhrHooks" colspan=4>No XHR Requests collected yet!</td></tr>');
    } else {
      xhrHooks.forEach(function(xhrHook) {
        Utils.addToXhrTable(xhrHook);
      });
    }

    // UnSafe Anchors
    var unsafeAnchors = db.unsafeAnchors;
    if (unsafeAnchors.length < 1) {
      $('#unsafeAnchorTableBody').append('<tr><td id="noUnsafeAnchors" colspan=4>No Unsafe anchor tags seen yet!</td></tr>');
    } else {
      unsafeAnchors.forEach(function(unsafeAnchor) {
        Utils.addToUnsafeAnchorTable(unsafeAnchor);
      });
    }

    // ALL SETTINGS HANDLERS GO HERE.

    // Hook document.location.hash
    $('#settings_domss_document_location_hash').bootstrapSwitch('state', db.dom.settings.sources.document_location_hash);
    $('#settings_domss_document_location_hash').on('switchChange.bootstrapSwitch', function(event, state) {
      db.dom.settings.sources.document_location_hash = state;
      chrome.storage.local.set(db);
    });

    // Hook Eval
    $('#settings_domss_window_eval').bootstrapSwitch('state', db.dom.settings.sinks.window_eval);
    $('#settings_domss_window_eval').on('switchChange.bootstrapSwitch', function(event, state) {
      db.dom.settings.sinks.window_eval = state;
      chrome.storage.local.set(db);
    });

    // Hook document.write
    $('#settings_domss_document_write').bootstrapSwitch('state', db.dom.settings.sinks.document_write);
    $('#settings_domss_document_write').on('switchChange.bootstrapSwitch', function(event, state) {
      db.dom.settings.sinks.document_write = state;
      chrome.storage.local.set(db);
    });

    // Hook window_setTimeout
    $('#settings_domss_window_setTimeout').bootstrapSwitch('state', db.dom.settings.sinks.window_setTimeout);
    $('#settings_domss_window_setTimeout').on('switchChange.bootstrapSwitch', function(event, state) {
      db.dom.settings.sinks.window_setTimeout = state;
      chrome.storage.local.set(db);
    });

    // Hook window_setInterval
    $('#settings_domss_window_setInterval').bootstrapSwitch('state', db.dom.settings.sinks.window_setInterval);
    $('#settings_domss_window_setInterval').on('switchChange.bootstrapSwitch', function(event, state) {
      db.dom.settings.sinks.window_setInterval = state;
      chrome.storage.local.set(db);
    });

    // domss_emtpy_values
    $('#settings_domss_empty_values').bootstrapSwitch('state', db.dom.settings.ignoreEmptyValues);
    $('#settings_domss_empty_values').on('switchChange.bootstrapSwitch', function(event, state) {
      db.dom.settings.ignoreEmptyValues = state;
      chrome.storage.local.set(db);
    });

    // xhook
    $('#settings_domss_xhr').bootstrapSwitch('state', db.dom.settings.xhr.enabled);
    $('#settings_domss_xhr').on('switchChange.bootstrapSwitch', function(event, state) {
      db.dom.settings.xhr.enabled = state;
      chrome.storage.local.set(db);
    });

    // unsafeAnchors
    $('#settings_domss_unsafe_anchors').bootstrapSwitch('state', db.dom.settings.unsafeAnchors.enabled);
    $('#settings_domss_unsafe_anchors').on('switchChange.bootstrapSwitch', function(event, state) {
      db.dom.settings.unsafeAnchors.enabled = state;
      chrome.storage.local.set(db);
    });

    // xdomain unsafeAnchors
    $('#settings_domss_unsafe_anchors_xdomain').bootstrapSwitch('state', db.dom.settings.unsafeAnchors.xdomain);
    $('#settings_domss_unsafe_anchors_xdomain').on('switchChange.bootstrapSwitch', function(event, state) {
      db.dom.settings.unsafeAnchors.xdomain = state;
      chrome.storage.local.set(db);
    });

  }); // end of db, chrome.storage


  // Listen to dynamic chrome.storage events
  chrome.storage.onChanged.addListener(function(changes) {
    var doItOnceForDomss = true;
    var doItOnceForXhr = true;
    var doItOnceForUnsafeAnchors = true;

    // dom ss
    if (changes.stats != null) {
      if (doItOnceForDomss) {
        $('#noDomssStats').remove();
        doItOnceForDomss = false;
      }
      Utils.addToDomssTable(changes.stats.newValue[changes.stats.newValue.length - 1]);

    }

    // xhr
    if (changes.xhrHooks != null) {
      if (doItOnceForXhr) {
        $('#noXhrHooks').remove();
        doItOnceForXhr = false;
      }
      Utils.addToXhrTable(changes.xhrHooks.newValue[changes.xhrHooks.newValue.length - 1]);

    }

    // unsafeAnchors
    if (changes.unsafeAnchors != null) {
      if (doItOnceForUnsafeAnchors) {
        $('#noUnsafeAnchors').remove();
        doItOnceForUnsafeAnchors = false;
      }
      Utils.addToUnsafeAnchorTable(changes.unsafeAnchors.newValue[changes.unsafeAnchors.newValue.length - 1]);

    }


  })

});


var Hookish = {

  // Match sink.score(source)
  isDomFlow: function(source, sink) {
    return (sink.score(source) > 0.3)
  }

}