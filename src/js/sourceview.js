window.onload = function() {
  var hash = window.location.search.split('=')[1];
  var line;
  if (hash.includes(',')) {
    line = hash.split(',')[1];
    hash = hash.split(',')[0];
  }
  chrome.storage.local.get('sourceCodes', function(db) {
    var code = db.sourceCodes[hash];
    var cm = CodeMirror(document.getElementById('code'), {
      value: code,
      mode: "javascript",
      lineNumbers: true,
      lineWrapping: true,
      readOnly: true,
      theme: 'solarized dark'
    });
    if (typeof line !== 'undefined') {
      cm.markText({
        line: line - 1,
        ch: 0
      }, {
        line: line,
        ch: 0
      }, {
        className: "line-select"
      });
    }
  });


};