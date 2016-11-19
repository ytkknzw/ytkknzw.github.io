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
var ChartsComponent = (function () {
    function ChartsComponent() {
    }
    ChartsComponent.prototype.ngOnInit = function () {
        var $h1 = $('h1');
        console.log($h1);
        alert($h1.text());
    };
    ChartsComponent.prototype.goBack = function () {
        history.back();
    };
    ChartsComponent = __decorate([
        core_1.Component({
            selector: 'my-ex-charts',
            template: "\n<header class=\"header\">\n\t<div class=\"header-left\">\n\t\t<button class=\"btn btn-link\" (click)=\"goBack()\">\n\t\t\t<i class=\"glyphicon glyphicon-chevron-left\"></i>\n\t\t\t<span class=\"hidden-xs\"> Back</span>\n\t\t</button>\n\t</div>\n\t<div class=\"header-title\">Charts</div>\n\t<div class=\"header-right\">\n\t\t<button class=\"btn btn-link\" (click)=\"goBack()\">\n\t\t\t<i class=\"glyphicon glyphicon-option-vertical\"></i>\n\t\t\t<span class=\"hidden-xs\"> Actions</span>\n\t\t</button>\n\t</div>\n</header>\n<section>\n\t<h1> Page Body </h1>\n</section>\n"
        }), 
        __metadata('design:paramtypes', [])
    ], ChartsComponent);
    return ChartsComponent;
}());
exports.ChartsComponent = ChartsComponent;
