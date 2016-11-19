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
var TextService = (function () {
    function TextService(http) {
        this.http = http;
        this.URL = 'http://localhost/slim-app/public/index.php/text';
        this.URL2 = 'http://localhost/slim-app/public/index.php/text2';
    }
    TextService.prototype.handleError = function (error) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    };
    TextService.prototype.select2 = function () {
        return this.http.get(this.URL2).toPromise()
            .then(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    TextService.prototype.select = function (locale, page) {
        var url = this.URL + '/' + locale + (page ? '/' + page : '');
        return this.http.get(url).toPromise()
            .then(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    TextService.prototype.insert = function (row) {
        var url = this.URL;
        return this.http.get(url).toPromise()
            .then(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    TextService.prototype.update = function (row) {
        var url = this.URL;
        return this.http.get(url).toPromise()
            .then(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    TextService.prototype.delete = function (id) {
        var url = this.URL + '/' + id;
        return this.http.get(url).toPromise()
            .then(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    TextService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], TextService);
    return TextService;
}());
exports.TextService = TextService;
