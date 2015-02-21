
$(function(){
    // Update the version info
    $('#version-info').text("v"+chrome.runtime.getManifest().version)
    // Bootstrap switch
    chrome.storage.local.get(null, function(db){
      $('#status').bootstrapSwitch('state', db.state);
      if(db.state)  $('#domain').html(db.domain);
      $('#status').on('switchChange.bootstrapSwitch', function (event, state) {
          if(state == true){
            bootbox.prompt({title:'Enter the domain you want to run Hookish! (Eg: github.com)', value: db.domain,callback: function(domain){
              if(domain != null && domain.length > 0) {
                chrome.storage.local.set({'domain': domain});
                chrome.storage.local.set({'state': true});
                $('#domain').html(domain);
                // update table
              }
              else{
                $('#status').bootstrapSwitch('state', false);  
                $('#domain').html('');
                return;
              }
            }});
          } else {
            chrome.storage.local.set({'state': false});
            $('#domain').html('');
            chrome.storage.local.set({stats: []});
            // need to update table,
          }
      });


    // DOM Sources & Sinks
    var stats = db.stats;
    if(stats.length < 1){
      $('#domssTableBody').append('<tr><td id="noDomssStats" colspan=4>No stats collected yet!</td></tr>');
    } else{
        stats.forEach(function(stat){
          Utils.addToDomssTable(stat);
        });
    }



    // Settings
    $('#settings_domss_empty_values').bootstrapSwitch('state', db.settings.domss_empty_values);
    $('#settings_domss_empty_values').on('switchChange.bootstrapSwitch', function (event, state) {
      chrome.storage.local.set({'settings': {'domss_empty_values': state}});      
    });


    $('body').on('click', '.page-scroll a', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
  });


  // Listen to dynamic chrome.storage events
  chrome.storage.onChanged.addListener(function(changes){
    var doItOnce = true;
    if(changes.stats != null){
      if(doItOnce)
        $('#noDomssStats').remove();
      Utils.addToDomssTable(changes.stats.newValue[changes.stats.newValue.length-1]);
    }
  })

});


var Hookish = {

  // Match sink.score(source)
  isDomFlow: function(source, sink){
    return (sink.score(source) > 0.3)
  }


}





