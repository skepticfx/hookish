window.onload = function(){
  console.log("starting to do some nasty code");
  // http://stackoverflow.com/questions/5142337/read-a-javascript-cookie-by-name
  // More relevant since people usually copy paste.
  function getCookie(c_name)
  {
      var i,x,y,ARRcookies=document.cookie.split(";");

      for (i=0;i<ARRcookies.length;i++)
      {
          x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
          y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
          x=x.replace(/^\s+|\s+$/g,"");
          if (x==c_name)
          {
              return unescape(y);
          }
      }
  }


  function doNasty(str){
      try{
          eval(str);
      }
      catch(e) {
          console.warn(e);
      }
  }

  doNasty(getCookie("xss"));
}
