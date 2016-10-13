var App = {

  base: '',

  locale: 'ja-JP',
  contents: mock_data_menu.value,
  pages: {},

  platform: {},

  init: function() {
    App.detectPlatform();
    if (localStorage.getItem('jwt') && App.contents) {
      $.get('./core/home.html', html => {
        $('body').html(html);
        App.showPage();
      })
    } else {
      App.logout();
    }
  },

  setupApplication: function() {

  },

  detectPlatform: function() {
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

    App.platform = {
      OsName      : OSName,
      BrowserName : browserName,
      FullVersion : fullVersion,
      MajorVersion: majorVersion,
      AppName     : navigator.appName,
      AppVersion  : navigator.appVersion,
      UserAgent   : navigator.userAgent,
      Height      : window.screen.availHeight,
      Width       : window.screen.availWidth
    };
    console.log('platform : ', App.platform);

    var locale = (navigator.languages != undefined ? navigator.languages[0] : navigator.language);
    console.log('locale : ', locale);
  },

  changeLocale: function(locale) {
    App.locale = locale;
  },

  hasPermission: function(path) {
    const [,cat,page] = path.split('/')
    var b = false;
    for (var i = App.contents.length - 1; i >= 0; i--) {
      var c = App.contents[i];
      if (c.key === cat) {
        for (var j = c.items.length - 1; j >= 0; j--) {
          if (c.items[j].key === page) {
            b = true;
            break;
          }
        }
      }
    }
    console.log('hasPermission:' + b);
    return b;
  },

  login: function() {
    localStorage.setItem('jwt', 'jwt');
    $.get('./core/home.html', html => {
      $('body').html(html)
      App.showPage();
    })
  },

  showLogoutDialog: function() {
    App.showModal({
      size: 'sm',
      animation: 'fade',
      title: 'LOG OUT',
      message: 'Are you sure to log out?',
      buttons: [{
        title: 'Cancel'
      },{
        title: 'LOG OUT',
        action: function() {
          App.logout();
        }
      }]
    })
  },

  logout: function() {
    localStorage.removeItem('jwt');
    $.get('./core/login.html', html => $('body').html(html))
  },

  buildMenu: function() {
    if(!App.pages.menu) {
      // var h = '<div id="menu-message" class="alert alert-danger"></div>';
      var h = '<div class="w1024" style="padding-bottom: 300px;">';
      for (let i=0, l=App.contents.length; i<l; i++) {
        var cat = App.contents[i];
        h += '<div class="menu">'
          + '<span class="menu-title">' + cat.title + '</span> &nbsp;'
          + '<span class="menu-desc">' + cat.description + '</span>'
          + '<div class="row">';
          for (let j=0, m=cat.items.length; j<m; j++) {
            var item = cat.items[j];
            h += ''
              + '<div class="col-md-3 col-sm-4">'
                + '<a class="menu-item" href="#/' + cat.key + '/' + item.key + '">'
                  + '<span class="menu-item-title"></i>' + item.title + '</span>'
                + '</a>'
              + '</div>';
          }
        h += '</div>'
          + '</div>';
      }
      h += '</div>';
      App.pages.menu = h;
    }
    $('#content-pane').html(App.pages.menu);
    App.setContentPath('Menu');
  },

	showPage: function(obj) {
    console.log('showPage : ', obj);
    // if($.type(obj) !== 'object') {
    //   console.log('App.showPage arg0 must be object');
    // } else {
      const [, category, content] = location.hash.split('/');
      if (content === undefined) {
        console.log('showPage: content undefined');
      }
      if(category === '' || category === undefined || category === 'menu') {
        console.log('build menu');
        App.buildMenu();
        // localStorage.setItem('currentPath', location.hash);
      } else if(category !== undefined) {
        if (App.hasPermission(location.hash)) {
          // localStorage.setItem('currentPath', location.hash);
          console.log('Has Permission:'+location.hash);
        } else {
          console.log('No permission:'+location.hash);
          return;
        }
				$.ajax({
					url: './content/' + content + '.html',
					error: function(err, dat){
            $.get('./core/not-found.html', html => $('#content-pane').html(html))
						// $('#menu-message').html(JSON.stringify(err));
					},
					success: function(html, res, req) {
            scroll(0, 0);
						$('#content-pane').html(html);
            App.setContentPath('Menu &raquo; ' + category + ' &raquo; ' + content);
					}
				});
			} else {
        $.get('./core/not-found.html', html => $('#content-pane').html(html))
        // $('#content').css({display: 'none'});
        // $('#menu-pane').css({display: 'block'});
      }
    // }
	},

  setContentPath: function(path) {
    $('#content-path').html(path);
  },

  setFullWidth: function setFullWidth(b) {
    (b ? $('.w1024').addClass('auto') : $('.w1024').removeClass('auto'))
  },

  toggleLeft: function toggleLeft() {
    // alert('left');
    // var w = $('.w1024')
    var left = $('#side-bar');
    if(left.hasClass('side-close')){  /* open */
      left.removeClass('side-close');
    } else {
      left.addClass('side-close');
    }
  },

  showModal: function(prmObj) {
    var h = '<div class="modal" id="myModal" tabindex="-1">'
      + '<div class="modal-dialog">'
        + '<div class="modal-content">';
    if(prmObj.title) {
       h += '<div class="modal-header">'
            + '<span class="modal-title">' + prmObj.title + '</span>'
          + '</div>';
    }
       h += '<div class="modal-body">' + prmObj.message + '</div>';
       h += '<div class="modal-footer">'
            + '<button class="btn btn-default" data-dismiss="modal">'
              + prmObj.buttons[0].title 
            + '</button>';
    if(prmObj.buttons.length>1) {
         h += '<button class="btn btn-primary">' + prmObj.buttons[1].title + '</button>';
    }
       h += '</div>'
        + '</div>'
      + '</div>'
    + '</div>';
    var modal = $(h);
    if(prmObj.buttons.length>1) {
      modal.find('.btn-primary').on('click', function(){
        $('#myModal').modal('hide');
        prmObj.buttons[1].action();
      });
    }
    if(prmObj.animation) {
      modal.find('.modal').addClass(prmObj.animation);
    }
    if(prmObj.size){
      modal.find('.modal-dialog').addClass('modal-' + prmObj.size);
    }
    $('body').append(modal);
    $('#myModal').modal('show');
  }
};

window.onload = App.init;
window.onhashchange = App.showPage;
