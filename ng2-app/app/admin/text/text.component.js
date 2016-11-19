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
var text_service_1 = require('./text.service');
var TextComponent = (function () {
    function TextComponent(textService) {
        this.textService = textService;
        this.type = window['__App']['getScreenType']();
        this.locales = ['en', 'ja', 'han-t', 'han-s', 'ko', 'fr', 'es', 'ru'];
        this.pages = ['login', 'home'];
        this.conf = {
            startCols: 4,
            colHeaders: ['Page', 'Key', 'en', 'ja'],
            columns: [
                { data: 'page' },
                { data: 'key' },
                { data: 'en' },
                { data: 'ja' },
            ],
            manualColumnResize: true,
            manualColumnMove: true,
            startRows: 1,
            rowHeaders: true,
            currentRowClassName: 'ht-currentRow',
            minSpareRows: 1,
            outsideClickDeselects: true,
        };
    }
    TextComponent.prototype.ngOnInit = function () {
        window.scroll(0, 0);
    };
    TextComponent.prototype.ngAfterViewInit = function () {
        this.hot = new Handsontable(document.getElementById('hot'), this.conf);
        this.loadData();
    };
    TextComponent.prototype.loadData = function () {
    };
    TextComponent.prototype.selectAll = function (type) {
    };
    TextComponent.prototype.showLocaleDlg = function (type) {
    };
    TextComponent = __decorate([
        core_1.Component({
            template: "\n<style>\ninput {\n  margin: -4px -8px;\n}\nbutton {\n  padding: 4px 10px;\n}\n</style>\n<header class=\"header\">\n  <div class=\"header-title\">\n    Text Edit\n  </div>\n  <div class=\"header-left\">\n    <a class=\"btn btn-link\" routerLink=\"/home\">\n      <i class=\"glyphicon glyphicon-chevron-left\"></i>\n      Back\n    </a>\n  </div>\n  <div class=\"header-right\">\n    <a class=\"btn btn-link\" (click)=\"showLocaleDlg('add')\">\n      <i class=\"glyphicon glyphicon-plus\"></i>\n      Add Locale\n    </a>\n    <a class=\"btn btn-link\" (click)=\"showLocaleDlg('del')\">\n      <i class=\"glyphicon glyphicon-trash\"></i>\n      Remove Locale\n    </a>\n  </div>\n</header>\n\n<div id=\"content-pant\" style=\"padding: 44px 0 200px;\">\n\n  <div class=\"row\" style=\"margin: 16px 0;\">\n\n    <div class=\"col-lg-2 col-md-2 col-sm-2\">\n      <button class=\"btn btn-primary btn-block\" (click)=\"loadData()\">Load Data</button>\n      <h5>Locale</h5>\n      <select class=\"form-control\" id=\"sel_locale\">\n        <option *ngFor=\"let locale of locales\" value=\"{{locale}}\">{{locale}}</option>\n        <option value=\"all\">All</option>\n      </select>\n      <h5>Page</h5>\n      <div class=\"list-group\">\n        <button class=\"list-group-item\" (click)=\"selectAll('page')\">All</button>\n        <button class=\"list-group-item\" *ngFor=\"let page of pages\">{{page}}</button>\n      </div>\n      <select class=\"form-control\" id=\"sel_page\">\n        <option *ngFor=\"let page of pages\" value=\"{{page}}\">{{page}}</option>\n        <option value=\"all\">All</option>\n      </select>\n    </div>\n\n    <div class=\"col-lg-10 col-md-10 col-sm-10\">\n      <div class=\"btn-toolbar\">\n        <div class=\"btn-group\">\n          <button class=\"btn btn-default active\"><b>All Locales</b></button>\n          <button class=\"btn btn-default\" style=\"min-width: 60px;\">en</button>\n          <button class=\"btn btn-default\" style=\"min-width: 60px;\">ja</button>\n          <button class=\"btn btn-default\" style=\"min-width: 60px;\">hans-s</button>\n          <button class=\"btn btn-default\" style=\"min-width: 60px;\">hans-t</button>\n          <button class=\"btn btn-default\" style=\"min-width: 60px;\">ko</button>\n          <button class=\"btn btn-default\" style=\"min-width: 60px;\">fr</button>\n          <button class=\"btn btn-default\" style=\"min-width: 60px;\">es</button>\n          <button class=\"btn btn-default\" style=\"min-width: 60px;\">ru</button>\n        </div>\n        <div class=\"btn-group\">\n          <button class=\"btn btn-info\">\n            <i class=\"glyphicon glyphicon-plus\"></i>\n            Add\n          </button>\n          <button class=\"btn btn-danger\">\n            <i class=\"glyphicon glyphicon-plus\"></i>\n            Delete\n          </button>\n        </div>\n      </div>\n      <br/>\n\n      <div id=\"hot\"></div>\n\n      <h4>text 2</h4>\n      <div id=\"hot2\"></div>\n    </div>\n\n  </div>\n\n</div>\n"
        }), 
        __metadata('design:paramtypes', [text_service_1.TextService])
    ], TextComponent);
    return TextComponent;
}());
exports.TextComponent = TextComponent;
