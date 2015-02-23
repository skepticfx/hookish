$(function() {
  // Update the version info
  $('#version-info').text("v" + chrome.runtime.getManifest().version)
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
              // update table
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
      db.dom.settings.sinks.widnow_eval = state;
      chrome.storage.local.set(db);
    });

    // Hook document.write
    $('#settings_domss_document_write').bootstrapSwitch('state', db.dom.settings.sinks.document_write);
    $('#settings_domss_document_write').on('switchChange.bootstrapSwitch', function(event, state) {
      db.dom.settings.sinks.document_write = state;
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


  }); // end of db, chrome.storage


  // Listen to dynamic chrome.storage events
  chrome.storage.onChanged.addListener(function(changes) {
    var doItOnceForDomss = true;
    var doItOnceForXhr = true;

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
        doItOnceForXhr = true;
      }
      Utils.addToXhrTable(changes.xhrHooks.newValue[changes.xhrHooks.newValue.length - 1]);

    }

  })

});


var Hookish = {

  // Match sink.score(source)
  isDomFlow: function(source, sink) {
    return (sink.score(source) > 0.3)
  }

}