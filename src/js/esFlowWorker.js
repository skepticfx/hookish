importScripts('libs/esflow.js');
importScripts('libs/beautify.js');

self.addEventListener('message', function(e) {
  var res;
  if (isStandardLibrary(e.data.code)) {
    res = {
      errMessage: 'The file ' + e.data.src + ' seems to be a standard library. Skipping analysis for that.'
    };
  } else {
    try {
      res = esflow.analyze(beautify(e.data.code), e.data.esFlowOptions);
    } catch (err) {
      switch (err.description) {
        case 'Unexpected token ILLEGAL':
          res = {
            errMessage: 'Stopped scanning ' + e.data.src + ' due to some syntax error.'
          };
          break;
        default:
          res = {
            errMessage: 'An exception occured while analyzing the code on ' + e.data.src
          };
          console.log(err.stack);
      }
    }
  }
  console.log(res);
  self.postMessage(res);

});