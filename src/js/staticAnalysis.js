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
var sourceCodes = {};

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

    function doEsFlowScan(script, code, codeHash, cb) {
      var esFlowWorker = new Worker('js/esFlowWorker.js');
      var src = script;
      var res = '';

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
            log('<b>   !! Possible DOM XSS !! : ' + p.source.name + ' assigned to ' + p.sink.name + ' - <a target="_blank" href="/sourceview.html?code=' + codeHash + ',' + p.lineNumber + '" > Line ' + p.lineNumber + '</a></b>');
          });
          res.functionCallPairs.forEach(function(p) {
            log('<b>   !! Possible DOM XSS !! : ' + p.source.name + ' assigned to ' + p.sink.name + ' - <a target="_blank" href="/sourceview.html?code=' + codeHash + ',' + p.lineNumber + '" > Line ' + p.lineNumber + '</a></b>');
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
    });

    // the scripts array is shifted every time a script is processed.
    function iterateScriptsAndScan(scripts) {
      var code;
      var script = scripts[0];
      var codeHash = script.hashCode();
      log('   ');
      log('Analyzing <i><a href="/sourceview.html?code=' + codeHash + '" target="_blank">' + script + '</a> </i>');
      try {
        code = fetchScript(script);
        sourceCodes[codeHash] = beautify(code);
        chrome.storage.local.set({
          "sourceCodes": sourceCodes
        });
      } catch (fetchException) {
        log('Error while fetching the script source');
        scripts.shift();
        iterateScriptsAndScan(scripts);
        return;
      }
      doEsFlowScan(script, code, codeHash, function() {
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


String.prototype.hashCode = function() {
  var hash = 0,
    i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};