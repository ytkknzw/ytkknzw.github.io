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
var LoginComponent = (function () {
    function LoginComponent(router, appService) {
        this.router = router;
        this.appService = appService;
        this.texts = {};
        this.credential = {
            email: '',
            password: '',
            remember: false
        };
        this.locales = [
            { key: 'en', name: 'English' },
            { key: 'ja', name: '日本語' }];
        this.selectedLocale = 'en';
        console.log('Login Const');
        this.selectedLocale = this.appService.locale;
        this.texts = this.appService.getText('login');
    }
    LoginComponent.prototype.ngOnInit = function () {
        if (this.appService.jwt) {
            this.appService.jwt = '';
        }
    };
    LoginComponent.prototype.changeLocale = function () {
        this.appService.locale = this.selectedLocale;
        this.texts = this.appService.getText('login');
    };
    LoginComponent.prototype.login = function () {
        var _this = this;
        console.log('login comp - login: start');
        this.appService.authenticate(this.credential)
            .then(function (b) { return _this.router.navigate(['/home']); })
            .catch(function (err) { return alert(err); });
    };
    LoginComponent = __decorate([
        core_1.Component({
            template: "\n<div style=\"padding: 0; margin: 0 auto; width: 300px;\">\n  <h1 style=\"text-align: center;\"><span style=\"font-weight: 200;\">CEGB</span> <b>Admin</b></h1>\n  <br/>\n  <div class=\"form-group\">\n    <!-- <label for=\"account\">Account</label> -->\n    <input id=\"account\" class=\"form-control\" type=\"text\" \n      placeholder=\"{{texts.account}}\" [(ngModel)]=\"credential.email\">\n  </div>\n  <div class=\"form-group\">\n    <!-- <label for=\"password\">Password</label> -->\n    <input id=\"password\" class=\"form-control\" type=\"password\" \n      placeholder=\"{{texts.password}}\" [(ngModel)]=\"credential.password\">\n  </div>\n  <div class=\"form-group checkbox\">\n    <label>\n      <input type=\"checkbox\" [(ngModel)]=\"credential.remember\"> {{texts.remember_me}}\n    </label>\n  </div>\n  <br/>\n  <div class=\"form-group\">\n    <button id=\"btn_login\" class=\"btn btn-primary btn-block\" (click)=\"login()\">{{texts.login}}</button>\n  </div>\n  <div class=\"form-group\">\n    <label for=\"language\">{{texts.language}}</label>\n    <select id=\"language\" class=\"form-control\" [(ngModel)]=\"selectedLocale\" (ngModelChange)=\"changeLocale()\">\n      <option *ngFor=\"let locale of locales\" value=\"{{locale.key}}\">{{locale.name}}</option>\n    </select>\n  </div>\n  <br/>\n  <a href=\"#\">{{texts.register}}</a> &nbsp;| &nbsp;<a href=\"#\">{{texts.forgot}}</a>\n</div>\n"
        }), 
        __metadata('design:paramtypes', [router_1.Router, app_service_1.AppService])
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
