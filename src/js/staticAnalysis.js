/**
 * ESFlow options
 *
 * Sources and Sinks
 */
let sources = ['document.cookie', 'location.href', 'location.hash', 'window.name', 'location', 'XMLHttpRequest'];
let sinks = ['.innerHTML', '.outerHTML', '$', 'jQuery', 'eval', 'setTimeout', 'document.write', 'location'];
let esFlowOptions = {
  sources: sources,
  sinks: sinks
};
let sourceCodes = {};
let id = 0;

chrome.storage.local.get('lastCollectedScripts', function(db) {
  let scriptsFromDB = db.lastCollectedScripts;

  $(function() {
    let esFlowResults = $('#esFlowResults');
    let log = function(log) {
      console.log(log);
      esFlowResults.append(log + '</br>');
    };
    log('');

    function doEsFlowScan(script, code, codeHash, resultDiv, cb) {
      let esFlowWorker = new Worker('js/esFlowWorker.js');
      let src = script;
      let res = '';

      esFlowWorker.addEventListener('message', function(e) {
        res = e.data;
        if (res.errMessage) {
          resultDiv.append(res.errMessage);
          cb();
          return;
        }
        if (res.loggedSources.length > 0) {
          res.loggedSources.forEach(function(s) {
            resultDiv.append('</br>');
            resultDiv.append(s);
          });
        }

        if (res.assignmentPairs.length > 0 || res.functionCallPairs.length > 0) {
          resultDiv.append('----------------- Found issues --------------------');
          res.assignmentPairs.forEach(function(p) {
            resultDiv.append('<b>   !! Possible DOM XSS !! : ' + p.source.name + ' assigned to ' + p.sink.name + ' - <a target="_blank" href="/sourceview.html?code=' + codeHash + ',' + p.lineNumber + '" > Line ' + p.lineNumber + '</a></b>');
          });
          res.functionCallPairs.forEach(function(p) {
            resultDiv.append('<b>   !! Possible DOM XSS !! : ' + p.source.name + ' assigned to ' + p.sink.name + ' - <a target="_blank" href="/sourceview.html?code=' + codeHash + ',' + p.lineNumber + '" > Line ' + p.lineNumber + '</a></b>');
          });
        }
        cb();
      });

      esFlowWorker.postMessage({
        code: code,
        src: src,
        esFlowOptions: esFlowOptions
      });
      esFlowWorker.stopScan = function() {
        esFlowWorker.terminate();
        cb();
      }

      return esFlowWorker;
    }


    // the scripts array is shifted every time a script is processed.
    function iterateScriptsAndScan(scripts) {
      id += 1;
      let code;
      let script = scripts[0];
      let codeHash = script.hashCode();
      log('   ');
      let resultDiv = $('<div class="rr">Analyzing <i><a href="/sourceview.html?code=' + codeHash + '" target="_blank">' + script + '</a> </i></br> </div><br/>');
      esFlowResults.append(resultDiv);
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
      let worker = doEsFlowScan(script, code, codeHash, resultDiv, function() {
        scripts.shift();
        let div = $('#worker_' + id);
        if (div.children().first().is('button')) {
          div.remove();
          resultDiv.append('</br></br>Finished..');
        }
        if (scripts.length === 0) {
          log('Finished scanning all JS code.');
          return;
        }
        iterateScriptsAndScan(scripts);
      });

      esFlowResults.append('<div id="worker_' + id + '"><button>Stop</button></div>');

      $('#worker_' + id).click(function() {
        $(this).html("Stopped");
        worker.stopScan();
      });

    }


    function fetchScript(src) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', src, false);
      xhr.send();
      return xhr.responseText;
    }


    // main block
    let scripts = scriptsFromDB.slice();
    esFlowResults.html('');
    if (scripts.length === 0) {
      log('No scripts to analyze.');
      return;
    }
    console.log('Collected scripts:' + scripts);
    log('Initiating ESFlow . . .');

    iterateScriptsAndScan(scripts);
  });
});


String.prototype.hashCode = function() {
  let hash = 0,
    i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};