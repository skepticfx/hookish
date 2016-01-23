importScripts('libs/esflow.js');

addEventListener('message', function(e) {
  try {
    var res = esflow.analyze(code, esFlowOptions);
    postMessage(res);
  } catch (e) {
    switch (e.description) {
      case 'Unexpected token ILLEGAL':
        console.log('Stopped scanning ' + src + ' due to some syntax error.');
        return;
      default:
        console.log('An exception occured while analyzing the code on ' + src);
        console.log(e.stack);
        return;
    }
  }
});