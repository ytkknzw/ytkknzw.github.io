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
var tm_service_1 = require('./tm.service');
var app_service_1 = require('../../app-core/app.service');
var TimeManagementComponent = (function () {
    function TimeManagementComponent(tmSvc, appSvc) {
        this.tmSvc = tmSvc;
        this.appSvc = appSvc;
        this.target = window['__App']['getScreenType']();
        this.userName = 'Yutaka Kanazawa';
        window.scrollTo(0, 0);
    }
    TimeManagementComponent.prototype.ngOnInit = function () {
    };
    TimeManagementComponent = __decorate([
        core_1.Component({
            template: "\n<style>\nth, td {\n  border: solid 1px #ddd;\n  padding: 4px 8px;\n  min-width: 100px;\n}\n</style>\n<header *ngIf=\"target=='desktop'\" class=\"header\" style=\"text-align: center;\">\n  <div class=\"header-title\">\n    Desktop &raquo; Time Management &raquo; {{userName}}\n  </div>\n</header>\n<header *ngIf=\"target=='tablet'\" class=\"header\" style=\"text-align: center;\">\n  <div class=\"header-title\">\n    Tablet &raquo; Time Management &raquo; {{userName}}\n  </div>\n</header>\n<header *ngIf=\"target=='phone'\" class=\"header\" style=\"text-align: center;\">\n  <div class=\"header-title\">\n    Time Management\n  </div>\n</header>\n<div id=\"content-pane\" class=\"w1024\" style=\"padding: 44px 8px 1000px 8px;\">\n\t<a class=\"btn btn-primary\" routerLink=\"/home\">Go Back</a>\n\n  <table>\n    <thead>\n      <tr>\n        <th>Vin</th>\n        <th>Year</th>\n        <th>Brand</th>\n        <th>Color</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td></td>\n        <td></td>\n        <td></td>\n        <td></td>\n      </tr>\n    </tbody>\n  </table>\n\n</div>",
            providers: [tm_service_1.TimeManagementService]
        }), 
        __metadata('design:paramtypes', [tm_service_1.TimeManagementService, app_service_1.AppService])
    ], TimeManagementComponent);
    return TimeManagementComponent;
}());
exports.TimeManagementComponent = TimeManagementComponent;
