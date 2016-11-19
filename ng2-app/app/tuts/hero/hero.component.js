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
var hero_service_1 = require('./hero.service');
var tuts_service_1 = require('../tuts.service');
var HeroComponent = (function () {
    function HeroComponent(tutsService) {
        this.userName = '';
        this.userName = tutsService.userName;
    }
    HeroComponent = __decorate([
        core_1.Component({
            template: "\n<header class=\"header\" style=\"text-align: center;\">\n  Heroes of {{userName}}\n</header>\n<div id=\"content-pant\" class=\"w1024\" style=\"padding: 44px 8px 1000px 8px;\">\n    <router-outlet></router-outlet>\n</div>",
            providers: [hero_service_1.HeroService]
        }), 
        __metadata('design:paramtypes', [tuts_service_1.TutorialService])
    ], HeroComponent);
    return HeroComponent;
}());
exports.HeroComponent = HeroComponent;
