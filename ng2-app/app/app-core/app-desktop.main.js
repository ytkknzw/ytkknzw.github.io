"use strict";
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var app_desktop_module_1 = require('./app-desktop.module');
console.log('desktop');
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_desktop_module_1.AppDesktopModule);
