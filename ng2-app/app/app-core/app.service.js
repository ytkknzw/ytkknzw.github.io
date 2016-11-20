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
var http_1 = require('@angular/http');
require('rxjs/add/operator/toPromise');
var texts_1 = require('./texts');
var AppService = (function () {
    function AppService(http) {
        this.http = http;
        this.texts = texts_1.TextData;
        this._menu = null;
        this.URL = 'http://localhost/slim-app/public/index.php';
        this.headers = new http_1.Headers({
            'Content-Type': 'application/json',
        });
        var locale = this.locale;
        if (!locale || locale == '' || typeof locale == 'undefined') {
            var p = window['__App']['Locale'].split('-');
            locale = (typeof p == 'string' ? p : p[0]);
            if (this.texts.hasOwnProperty(locale)) {
                this.locale = locale;
            }
            else {
                console.log('set default locale en');
                this.locale = 'en';
            }
        }
    }
    Object.defineProperty(AppService.prototype, "locale", {
        get: function () {
            return localStorage.getItem('cegb-admin.locale');
        },
        set: function (arg) {
            localStorage.setItem('cegb-admin.locale', arg);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppService.prototype, "jwt", {
        get: function () {
            if (!this._jwt)
                this._jwt = localStorage.getItem('cegb-admin.jwt');
            return this._jwt;
        },
        set: function (arg) {
            localStorage.setItem('cegb-admin.jwt', arg);
            this._jwt = arg;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppService.prototype, "menu", {
        get: function () {
            return JSON.parse(localStorage.getItem('cegb-admin.menu'));
        },
        set: function (arg) {
            localStorage.setItem('cegb-admin.menu', JSON.stringify(arg));
        },
        enumerable: true,
        configurable: true
    });
    AppService.prototype.handleError = function (error) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    };
    AppService.prototype.authenticate = function (credential) {
        var _this = this;
        var url = this.URL + '/authenticate';
        return this.http.post(url, credential).toPromise()
            .then(function (res) {
            _this.jwt = res.json().jwt;
            return true;
        }).catch(this.handleError);
    };
    AppService.prototype.getText = function (pageId) {
        return this.texts[this.locale][pageId];
    };
    AppService.prototype.getMenu = function () {
        var _this = this;
        console.log('app service - getMenu: start');
        if (!this.menu || this.menu.length < 1) {
            var url = this.URL + '/menu';
            return this.http.get(url).toPromise()
                .then(function (res) {
                _this.menu = res.json();
                return res.json();
            })
                .catch(this.handleError);
        }
        else {
            return Promise.resolve(this.menu);
        }
    };
    AppService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], AppService);
    return AppService;
}());
exports.AppService = AppService;
