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
chrome.storage.local.get('lastCollectedScripts', function(db) {

  $(function() {
    var scriptsFromDB = db.lastCollectedScripts;
    var esFlowResults = $('#esFlowResults');
    var log = function(log) {
      console.log(log);
      esFlowResults.append(log + '</br>');
    };
    log('  ');
    log('Collecting JS Scripts from the DOM . . .');

    function doEsFlowScan(script, cb) {
      var esFlowWorker = new Worker('js/esFlowWorker.js');
      var code;
      var src = script;
      var res = '';

      try {
        code = fetchScript(script);
      } catch (fetchException) {
        log('Error while fetching the script source');
        cb();
      }

      esFlowWorker.addEventListener('message', function(e) {
        res = e.data;
        if (res.errMessage) {
          log(res.errMessage);
          cb();
          return;
        }
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
        cb();
      });

      esFlowWorker.postMessage({
        code: code,
        src: src,
        esFlowOptions: esFlowOptions
      });

    }


    $('#startStaticAnalysisButton').click(function() {
      var scripts = scriptsFromDB.slice();
      esFlowResults.html('');
      if (scripts.length === 0) {
        log('No scripts to analyze.');
        return;
      }
      console.log('Collected scripts:' + scripts);
      log('Initiating ESFlow . . .');


      iterateScriptsAndScan(scripts);
      console.log(scripts.length)

    });


    function iterateScriptsAndScan(scripts) {
      log('   ');
      log('Analyzing <i><a href="' + scripts[0] + '" target="_blank">' + scripts[0] + '</a> </i>');
      doEsFlowScan(scripts[0], function() {
        scripts.shift();
        log('Finished..');
        if (scripts.length === 0) {
          log('Finished scanning all JS code.');
          return;
        }
        iterateScriptsAndScan(scripts);
      });
    }


    function fetchScript(src) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', src, false);
      xhr.send();
      return xhr.responseText;
    }

  });
});