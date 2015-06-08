$(function() {

  initPage();
  chrome.storage.local.get(null, function(db) {
    setupStatus(db);
    populateHookishSections('hookishSections', db);
    populateSettingsBody('section_settings_body', db);
    populateSectionTableBodyWithHooks(db);

    console.log(db);


    // Listen to dynamic chrome.storage events
    chrome.storage.onChanged.addListener(function(changes) {
      updateSectionTableBodyWithHooks(changes, db);

    }); // end of db chrome.storage.onChanged()
  }); // end of db-> chrome.storage.local.get()
}); // end of jQuery onLoad


var Hookish = {

  // Match sink.score(source)
  isDomFlow: function(source, sink) {
    return (sink.score(source) > 0.3)
  }

}