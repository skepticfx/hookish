/**
 * ESFlow options
 *
 * Sources and Sinks
 */
var sources = ['document.cookie', 'location.href', 'location.hash', 'window.name', 'location', 'XMLHttpRequest'];
var sinks = ['.innerHTML', '.outerHTML', '$', 'jQuery', 'eval', 'setTimeout', 'document.write', 'location'];
var esFlowOptions = {
  sources: sources,
  sinks: sinks
};


$(function() {

  function doEsFlowScan(code, src) {
    var res = '';
    var esFlowWorker = new Worker('js/esflow.js');
    esFlowWorker.addEventListener('message', function(e) {
      res = e.data;
      if (res.loggedSources.length > 0) {
        res.loggedSources.forEach(function(s) {
          log(s);
        });
      }

      if (res.assignmentPairs.length > 0 || res.functionCallPairs.length > 0) {
        log('----------------- Found issues --------------------');
        res.assignmentPairs.forEach(function(p) {
          log('<b>   !! Possible DOM XSS !! : ' + p.source.name + ' assigned to ' + p.sink.name + ' - Line ' + p.lineNumber + '</b>');
        });
        res.functionCallPairs.forEach(function(p) {
          log('<b>   !! Possible DOM XSS !! : ' + p.source.name + ' assigned to ' + p.sink.name + '() - Line ' + p.lineNumber + '</b>');
        });
      }
    });

  }

  var esFlowResults = $('#esFlowResults');
  var result = '';
  var log = function(log) {
    esFlowResults.append(log + '</br>');
  };

  $('#startStaticAnalysisButton').click(function() {
    esFlowResults.html('');
    log('  ');
    log('Collecting JS Scripts from the DOM . . .');
    chrome.storage.local.get('lastCollectedScripts', function(db) {
      var scripts = db.lastCollectedScripts;
      if (scripts.length === 0) {
        log('No scripts to analyze.');
        return;
      }
      console.log('Collected scripts:' + scripts);
      log('Initiating ESFlow . . .');
      scripts.forEach(function(script) {
        log('   ');
        log('Analyzing <i> ' + script + '</i>');
        doEsFlowScan(fetchScript(script), script);
      });
    });
  });

  function fetchScript(src) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', src, false);
    xhr.send();
    return xhr.responseText;
  }

});