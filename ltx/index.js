var MENUES = [
  {
      "key": "experimental",
      "title": "Experimental",
      "items": [{
          "title": "UI Forms",
          "key": "forms",
          "url": "ex/ex-ui-forms.html"
      }, {
          "title": "Google Map",
          "key": "map",
          "url": "ex/ex-map.html"
      }, {
          "title": "SVG Map",
          "key": "svg",
          "url": "ex/ex-map-svg.html"
      }, {
          "title": "Calendar",
          "key": "calendar",
          "url": "ex/ex-calendar.html"
      }, {
          "title": "Handwrite",
          "key": "handwrite",
          "url": "ex/ex-handwrite.html"
      }, {
          "title": "Charts",
          "key": "charts",
          "url": "ex/ex-charts.html"
      }, {
          "title": "Motion",
          "key": "motion",
          "url": "ex/ex-motion.html"
      }, {
          "title": "3D View",
          "key": "3d-view",
          "url": "ex/ex-3d-view.html"
      }, {
          "title": "UI Components",
          "key": "ui-components",
          "url": "ex/ex-ui-components.html"
      }]
  }, {
      "key": "operation",
      "title": "Operation",
      "description": "",
      "icon": "",
      "items": [{
          "title": "HR - Users Management",
          "key": "users",
          "url": "hr/hr-user.html"
      }, {
          "title": "HR - Organization Management",
          "key": "organization",
          "url": "hr/hr-organization.html"
      }, {
          "title": "HR - Employees",
          "key": "employee",
          "url": "hr/hr-employee.html"
      }, {
          "title": "HR - Time Management",
          "key": "time-management",
          "url": "hr/hr-tm.html"
      }, {
          "title": "Accounting",
          "key": "account",
          "url": "acc/acc-accounting.html"
      }, {
          "title": "CRM",
          "key": "crm",
          "url": "crm-crm.html"
      }, {
          "title": "SCM",
          "key": "scm",
          "url": "scm-scm.html"
      }, {
          "title": "Something More 01",
          "key": "app01",
          "url": "app-not-found.html"
      }, {
          "title": "Something More 02",
          "key": "app02",
          "url": "app-not-found.html"
      }, {
          "title": "Something More 03",
          "key": "app03",
          "url": "app-not-found.html"
      }, {
          "title": "Something More 04",
          "key": "app04",
          "url": "app-not-found.html"
      }, {
          "title": "Something More 05",
          "key": "app05",
          "url": "app-not-found.html"
      }]
  }, {
      "key": "personal",
      "title": "Personal",
      "description": "hello world",
      "icon": "",
      "items": [{
          "title": "Time Management",
          "key": "time-management",
          "url": "hr/hr-tm.html"
      }, {
          "title": "Workflow",
          "key": "workflow",
          "url": "wf-workflow.html"
      }, {
          "title": "Business Trip",
          "key": "business-trip",
          "url": "acc/acc-business-trip.html"
      }, {
          "title": "Traffic Fee",
          "key": "traffic-fee",
          "url": "acc/acc-traffic-fee.html"
      }]
  }, {
      "key": "management",
      "title": "Management",
      "description": "",
      "icon": "",
      "items": [{
          "title": "Time Management",
          "key": "time-management",
          "url": "hr/hr-tm.html"
      }, {
          "title": "Workflow",
          "key": "workflow",
          "url": "wf-workflow.html"
      }]
  }, {
      "key": "shared",
      "title": "Shared",
      "description": "",
      "icon": "",
      "items": [{
          "title": "Organization Information",
          "key": "organization",
          "url": "org-organization.html"
      }, {
          "title": "Book Shelf",
          "key": "book-shelf",
          "url": "shared-book-shelf.html"
      }]
  }, {
      "key": "admin",
      "title": "Administration",
      "description": "admin limited.",
      "icon": "",
      "items": [{
          "title": "Contents Management",
          "key": "contents",
          "url": "admin/admin-contents.html"
      }, {
          "title": "Permission Management",
          "key": "permission",
          "url": "admin/admin-permission.html"
      }]
  }
];

var App = {

  menu: MENUES,

  loadHash: function() { return localStorage.getItem('hash'); },
  saveHash: function(hash) { localStorage.setItem('hash', hash); },

  init: function() {
    var hash = App.loadHash();
    console.log('+++++ init app', hash);
    App.loadPage((hash ? hash : ''));
  },

  showPage: function() {
    console.log('try load page', location.hash);
    App.loadPage(location.hash);
  },

  loadPage: function(hash) {
    var p = hash.split('/');
    var url = '';
    for (var i = 0, ml = MENUES.length; i < ml; i++) {
      if(MENUES[i].key == p[1]) {
        for (var j = 0, il = MENUES[i].items.length; j < il; j++) {
          if(MENUES[i].items[j].key == p[2]) {
            url = MENUES[i].items[j].url;
            break;
          }
        }
      }
    }
    if(url === '') {
      url = {
        '': 'app-home.html',
        'home': 'app-home.html',
        'login': 'app-login.html'
      }[p[1]];
    }
    console.log('target url :', url);
    $.ajax({
      url: './page/' + url,
      error: function(err, dat){
        console.log('load page error', err, dat);
        var html = '<div style="padding: 32px;">' + JSON.stringify(err)
          + '<hr/><a class="btn btn-primary" href="javascript:history.back();">Go Back</a></div>';
        $('body').html(html);
      },
      success: function(html, res, req) {
        console.log('load page success');
        scroll(0, 0);
        App.saveHash(hash);
        $('body').html(html);
      }
    });
  },

  modal: {

    showLogoutDialog: function() {
      App.modal.showModal({
        size: 'sm',
        animation: 'fade',
        title: 'LOG OUT',
        message: 'Are you sure to log out?',
        buttons: [{
          title: 'Cancel'
        },{
          title: 'LOG OUT',
          action: function() {
            location.href = '#/app-login.html';
          }
        }]
      })
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
  }

};

window.onload = App.init;
window.onhashchange = App.showPage;

/*
  1240 / 4 = 310
  1240 / 5 = 248

  1024 / 4 = 256
  1024 / 5 = 204.8

   768 / 3 = 256
   768 / 4 = 192
*/
