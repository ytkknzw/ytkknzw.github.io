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
var DbService = (function () {
    function DbService(http) {
        this.http = http;
        this.URL = 'http://localhost/slim-app/public/index.php/database';
    }
    DbService.prototype.handleError = function (error) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    };
    DbService.prototype.getTables = function () {
        var url = this.URL;
        return this.http.options(url).toPromise()
            .then(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    DbService.prototype.getTableMetadata = function (table) {
        var url = this.URL + '/' + table;
        return this.http.options(url).toPromise()
            .then(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    DbService.prototype.select = function (table) {
        var url = this.URL + '/' + table;
        return this.http.get(url).toPromise().catch(this.handleError)
            .then(function (res) { return res.json(); });
    };
    DbService.prototype.insert = function (table) {
        var url = this.URL + '/' + table;
        return this.http.post(url, {}).toPromise()
            .then(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    DbService.prototype.update = function (table, id) {
        var url = this.URL + '/' + table + '/' + id;
        return this.http.put(url, {}).toPromise().catch(this.handleError)
            .then(function (res) { return res.json(); });
    };
    DbService.prototype.delete = function (table, id) {
        var url = this.URL + '/' + table + '/' + id;
        return this.http.delete(url).toPromise().catch(this.handleError)
            .then(function (res) { return res.json(); });
    };
    DbService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], DbService);
    return DbService;
}());
exports.DbService = DbService;
