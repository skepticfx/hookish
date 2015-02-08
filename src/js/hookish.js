
$(function(){
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
      $('#domssTableBody').append('<tr><td colspan=4>No stats collected yet!</td></tr>');
    } else{
        stats.forEach(function(stat){
          $('#domssTableBody').prepend('<tr><td><strong>' + stat.nature + '</strong></td><td>' + stat.type + '</td><td title="'+stat.data.replace(/"/gi,'%22')+'">'+ stripped(stat.data,50) +'</td><td>'+stat.href+'</td></tr>');
        });
    }

    $('body').on('click', '.page-scroll a', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
  });
});

// Floating label headings for the contact form
$(function() {
    $("body").on("input propertychange", ".floating-label-form-group", function(e) {
        $(this).toggleClass("floating-label-form-group-with-value", !! $(e.target).val());
    }).on("focus", ".floating-label-form-group", function() {
        $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function() {
        $(this).removeClass("floating-label-form-group-with-focus");
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});



function stripped(data, len){
  if(len <=10) return data;
  if(data.length <= len)  return data;
  return data.substr(0,len-4) + " ...";
}