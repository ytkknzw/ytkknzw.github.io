"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var app_service_1 = require('./app.service');
var HomeComponent = (function () {
    function HomeComponent(router, appService) {
        this.router = router;
        this.appService = appService;
        this.texts = {};
        this.type = window['__App']['getScreenType']();
        if (this.appService.jwt == '') {
            this.router.navigate(['/login']);
        }
        this.texts = this.appService.getText('home');
    }
    HomeComponent.prototype.ngOnInit = function () {
        this.menues = this.appService.getMenu();
    };
    HomeComponent.prototype.text = function (key) {
        return this.texts[key] || key;
    };
    HomeComponent.prototype.showLogoffDlg = function () {
        if (confirm('are you sure?')) {
            this.logout();
        }
    };
    HomeComponent.prototype.logout = function () {
        this.appService.jwt = '';
        this.appService.menu = [];
        this.router.navigate(['/login']);
    };
    HomeComponent = __decorate([
        core_1.Component({
            template: "\n<header class=\"header\">\n  <div class=\"header-title\" style=\"font-size: 20px;\">\n    CEGB <b>Admin</b>\n  </div>\n</header>\n\n<div id=\"content-pant\" class=\"w1024\" style=\"padding: 44px 0 100px 0;\">\n  <div class=\"menu\">\n    <img id=\"img-user\" src=\"../assets/img/square_male.png\"> y.kanazawa@cegb.co.jp\n    <span class=\"pull-right\">\n      <a class=\"btn btn-default\" routerLink=\"settings\" style=\"margin: 0 8px;\">\n        <i class=\"glyphicon glyphicon-cog\"></i> {{texts.settings}}\n      </a>\n      <a class=\"btn btn-primary\" (click)=\"showLogoffDlg()\">\n        <i class=\"glyphicon glyphicon-off\"></i> {{texts.logout}}\n      </a>\n    </span>\n    <div style=\"clear: both;\"></div>\n  </div>\n  <div class=\"menu\" *ngFor=\"let menu of menues | async\">\n    <span class=\"menu-title\">{{text(menu.key)}}</span>\n    <span class=\"menu-desc\">{{menu.description}}</span>\n    <div class=\"row\">\n      <div class=\"col-md-3 col-sm-4\" *ngFor=\"let item of menu.items\">\n        <a class=\"menu-item\" routerLink=\"../{{item.route}}\">\n          <i class=\"glyphicon glyphicon-chevron-right\"></i>\n          <span class=\"menu-item-title\">{{text(item.key)}}</span>\n        </a>\n      </div>\n    </div>\n  </div>\n</div>\n"
        }), 
        __metadata('design:paramtypes', [router_1.Router, app_service_1.AppService])
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
