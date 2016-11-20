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
var NotFoundComponent = (function () {
    function NotFoundComponent(router) {
        this.router = router;
    }
    NotFoundComponent.prototype.goBack = function () {
        console.log('dummy goback()');
        this.router.navigate(['/home']);
    };
    NotFoundComponent.prototype.ngOnInit = function () {
        window.scroll(0, 0);
    };
    NotFoundComponent = __decorate([
        core_1.Component({
            selector: 'my-notfound',
            template: "\n<header class=\"header\">\n  <div class=\"header-title\" style=\"font-size: 20px;\">\n    CEGB <b>Admin</b>\n  </div>\n  <div class=\"header-left\">\n    <a routerLink=\"/home\">Back</a>\n  </div>\n</header>\n\n<div id=\"content-pant\" class=\"w1024\" style=\"padding: 44px 8px 1000px 8px; text-align: center;\">\n\t<h1>Page Not Found</h1>\n\t<button class=\"btn btn-primary\" (click)=\"goBack()\">Back</button>\n</div>"
        }), 
        __metadata('design:paramtypes', [router_1.Router])
    ], NotFoundComponent);
    return NotFoundComponent;
}());
exports.NotFoundComponent = NotFoundComponent;
