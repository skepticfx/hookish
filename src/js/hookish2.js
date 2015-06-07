$(function() {
  // Update the version info
  $('#version-info').text("v" + chrome.runtime.getManifest().version)
    // Setup toggle for all canToggle divs
  $('.canToggle').click(function() {
      $(this).parent().find('.toggleMe').slideToggle();
    })
    // Bootstrap switch
  chrome.storage.local.get(null, function(db) {
    populateHookishSections('hookishSections', db);
    populateSettingsBody('section_settings_body', db);
    populateSectionTableBodyWithHooks(db);



    console.log(db);
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
        db.wsHooks = [];
        db.xhrHooks = [];
        db.unsafeAnchors = [];
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

    // WS
    var wsHooks = db.wsHooks;
    if (wsHooks.length < 1) {
      $('#wsTableBody').append('<tr><td id="noWsHooks" colspan=4>No WS Requests collected yet!</td></tr>');
    } else {
      wsHooks.forEach(function(wsHook) {
        Utils.addToWsTable(wsHook);
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


  }); // end of db, chrome.storage


  // Listen to dynamic chrome.storage events
  chrome.storage.onChanged.addListener(function(changes) {
    var doItOnceForDomss = true;
    var doItOnceForXhr = true;
    var doItOnceForUnsafeAnchors = true;
    var doItOnceForWs = true;

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

    // WS
    if (changes.wsHooks != null) {
      if (doItOnceForWs) {
        $('#noWsHooks').remove();
        doItOnceForWs = false;
      }
      Utils.addToWsTable(changes.wsHooks.newValue[changes.wsHooks.newValue.length - 1]);

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