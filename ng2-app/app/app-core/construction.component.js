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
var ConstructionComponent = (function () {
    function ConstructionComponent() {
        window.scrollTo(0, 0);
    }
    ConstructionComponent = __decorate([
        core_1.Component({
            template: "\n<header class=\"header\">\n  <div class=\"header-title\">\n    <i class=\"glyphicon glyphicon-home\"></i>\n     Under Construction... Coming Soon... Hopefuly...\n  </div>\n  <div class=\"header-left\">\n    <a routerLink=\"/home\">\n      <i class=\"glyphicon glyphicon-chevron-left\"></i>\n      <span class=\"hidden-xs\"> Back</span>\n    </a>\n  </div>\n</header>\n\n<div id=\"content-pane\" class=\"w1024\" style=\"padding: 44px 8px 1000px 8px; text-align: center;\">\n  <h1>Under Construction</h1>\n  <hr/>\n  <p>Coming Soon... Hopefuly...</p>\n</div>\n"
        }), 
        __metadata('design:paramtypes', [])
    ], ConstructionComponent);
    return ConstructionComponent;
}());
exports.ConstructionComponent = ConstructionComponent;
