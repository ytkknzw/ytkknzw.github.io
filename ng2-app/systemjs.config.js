/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  var type = ['desktop', 'tablet', 'phone'][0];
  var map0 = {
    // our app is within the app folder
    app: 'app',
    // core: 'core',

    // angular bundles
    '@angular/core':      'lib:@angular/core.umd.min.js',
    '@angular/common':    'lib:@angular/common.umd.min.js',
    '@angular/compiler':  'lib:@angular/compiler.umd.min.js',
    '@angular/forms':     'lib:@angular/forms.umd.min.js',
    '@angular/http':      'lib:@angular/http.umd.min.js',
    '@angular/router':    'lib:@angular/router.umd.min.js',
    '@angular/platform-browser':         'lib:@angular/platform-browser.umd.min.js',
    '@angular/platform-browser-dynamic': 'lib:@angular/platform-browser-dynamic.umd.min.js',

    // other libraries
    'rxjs':                       'lib:rxjs',
    // 'rxjs':                       'assets/required/rxjs',
    // 'handsontable':               'npm:handsontable',
    // 'primeng':                    'node_modules/primeng',
  };
  var map1 = {
    // our app is within the app folder
    app: 'app',
    // core: 'core',

    // angular bundles
    '@angular/core':      'npm:@angular/core/bundles/core.umd.js',
    '@angular/common':    'npm:@angular/common/bundles/common.umd.js',
    '@angular/compiler':  'npm:@angular/compiler/bundles/compiler.umd.js',
    '@angular/forms':     'npm:@angular/forms/bundles/forms.umd.js',
    '@angular/http':      'npm:@angular/http/bundles/http.umd.js',
    '@angular/router':    'npm:@angular/router/bundles/router.umd.js',
    '@angular/platform-browser':         'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',

    // other libraries
    'rxjs':                       'npm:rxjs',
    // 'handsontable':               'npm:handsontable',
    // 'primeng':                    'node_modules/primeng',
  };
  System.config({
    paths: {
      // paths serve as alias
      'npm:': 'node_modules/',
      'lib:': 'assets/required/'
    },
    // map tells the System loader where to look for things
    map : map0,
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './_core/app-'+ type + '.main.js',
        defaultExtension: 'js'
      },
      rxjs:         { defaultExtension: 'js' },
      // handsontable: { defaultExtension: 'js' },
    }
  });
})(this);
