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
var DummyComponent = (function () {
    function DummyComponent(router) {
        this.router = router;
        this.width = window['__App']['getWidth']();
        this.height = window['__App']['getHeight']();
        this.type = window['__App']['getScreenType']();
        window.scrollTo(0, 0);
    }
    DummyComponent.prototype.goBack = function () {
        console.log('dummy goback()');
        this.router.navigate(['/home']);
    };
    DummyComponent = __decorate([
        core_1.Component({
            template: "\n<header class=\"header\">\n  <div class=\"header-title\">\n    <span class=\"hidden-xs\">\n      <i class=\"glyphicon glyphicon-home\"></i>\n      Home &raquo; Operation &raquo; \n      Time Management\n    </span>\n    &nbsp;\n  </div>\n  <div class=\"header-left\">\n    <a routerLink=\"/home\">\n      <i class=\"glyphicon glyphicon-chevron-left\"></i>\n      <span class=\"hidden-xs\"> Back</span>\n    </a>\n      Time Management\n  </div>\n  <div class=\"header-right\">\n    <a href=\"#\">\n      <i class=\"glyphicon glyphicon-menu-hamburger\"></i>\n      <span class=\"hidden-xs\"> Options</span>\n    </a>\n    <a href=\"#\">\n      <i class=\"glyphicon glyphicon-option-vertical\"></i>\n      <span class=\"hidden-xs\"> Actions</span>\n    </a>\n  </div>\n</header>\n\n<div id=\"content-pane\" class=\"w1024\" style=\"padding: 44px 8px 1000px 8px; text-align: center;\">\n  <h1>Dummy Page Component</h1>\n  <h1>type:{{type}} (w:{{width}} h:{{height}})</h1>\n  <button class=\"btn btn-primary\" (click)=\"goBack()\">Back</button>\n  <hr/>\n  <div *ngIf=\"type=='desktop'\" class=\"well\">desktop</div>\n  <div *ngIf=\"type=='tablet'\" class=\"well\">tablet</div>\n  <div *ngIf=\"type=='phone'\" class=\"well\">phone</div>\n  <hr/>\n  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt, \n  accusantium quod. Quo accusantium cumque, quis culpa magni, voluptas \n  reiciendis rem excepturi error sint inventore deserunt similique, \n  eligendi suscipit reprehenderit blanditiis.</p>\n</div>\n"
        }), 
        __metadata('design:paramtypes', [router_1.Router])
    ], DummyComponent);
    return DummyComponent;
}());
exports.DummyComponent = DummyComponent;
