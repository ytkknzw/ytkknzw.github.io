(function(){
	"use strict"

    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName  = navigator.appName;
    var fullVersion  = '' + parseFloat(navigator.appVersion); 
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    // In Opera, the true version is after "Opera" or after "Version"
    if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
     browserName = "Opera";
     fullVersion = nAgt.substring(verOffset+6);
     if ((verOffset=nAgt.indexOf("Version"))!=-1) 
       fullVersion = nAgt.substring(verOffset+8);
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
     browserName = "Microsoft Internet Explorer";
     fullVersion = nAgt.substring(verOffset+5);
    }
    // In Chrome, the true version is after "Chrome" 
    else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
     browserName = "Chrome";
     fullVersion = nAgt.substring(verOffset+7);
    }
    // In Safari, the true version is after "Safari" or after "Version" 
    else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
     browserName = "Safari";
     fullVersion = nAgt.substring(verOffset+7);
     if ((verOffset=nAgt.indexOf("Version"))!=-1) 
       fullVersion = nAgt.substring(verOffset+8);
    }
    // In Firefox, the true version is after "Firefox" 
    else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
     browserName = "Firefox";
     fullVersion = nAgt.substring(verOffset+8);
    }
    // In most other browsers, "name/version" is at the end of userAgent 
    else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
              (verOffset=nAgt.lastIndexOf('/')) ) 
    {
     browserName = nAgt.substring(nameOffset,verOffset);
     fullVersion = nAgt.substring(verOffset+1);
     if (browserName.toLowerCase()==browserName.toUpperCase()) {
      browserName = navigator.appName;
     }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix=fullVersion.indexOf(";"))!=-1)
       fullVersion=fullVersion.substring(0,ix);
    if ((ix=fullVersion.indexOf(" "))!=-1)
       fullVersion=fullVersion.substring(0,ix);

    majorVersion = parseInt(''+fullVersion,10);
    if (isNaN(majorVersion)) {
     fullVersion  = ''+parseFloat(navigator.appVersion); 
     majorVersion = parseInt(navigator.appVersion,10);
    }

    var OSName="Unknown OS";
    if (navigator.appVersion.indexOf("Win"    )!=-1) OSName="Windows";
    if (navigator.appVersion.indexOf("Mac"    )!=-1) OSName="MacOS";
    if (navigator.appVersion.indexOf("iPad"   )!=-1) OSName="iOS";
    if (navigator.appVersion.indexOf("X11"    )!=-1) OSName="UNIX";
    if (navigator.appVersion.indexOf("Linux"  )!=-1) OSName="Linux";
    if (navigator.appVersion.indexOf("Android")!=-1) OSName="Android";

    var w = (window.screen.availHeight < window.screen.availWidth ? 
      window.screen.availHeight : window.screen.availWidth)
    var screenType = (w < 600 ? 'phone' : 599 < w && w <= 1024 ? 'tablet' : 'desktop')

    var locale = (navigator.languages != undefined ? navigator.languages[0] : navigator.language);

    window['__App'] = window.__App =  {
      OsName      : OSName,
      BrowserName : browserName,
      FullVersion : fullVersion,
      MajorVersion: majorVersion,
      AppName     : navigator.appName,
      AppVersion  : navigator.appVersion,
      UserAgent   : navigator.userAgent,
      getHeight      : function() { return window.screen.availHeight },
      getWidth       : function() { return window.screen.availWidth },
      getScreenType  : function() {
        // var w = (window.screen.availHeight < window.screen.availWidth ? 
        //   window.screen.availHeight : window.screen.availWidth)
        // if(OSName === 'iOS' || OSName === 'Android') {
          var w = window.screen.availWidth
          return (w < 600 ? 'phone' : (599 < w && w <= 1024 ? 'tablet' : 'desktop'))
        // } else {
          // return 'desktop'
        // }
      },
      Locale 	    : locale
    };
    console.log('platform : ', window.__App);

})();
