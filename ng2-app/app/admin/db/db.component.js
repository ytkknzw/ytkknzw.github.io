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
var db_service_1 = require('./db.service');
var DbComponent = (function () {
    function DbComponent(dbService) {
        this.dbService = dbService;
        this.type = window['__App']['getScreenType']();
        this.conf = {
            startCols: 4,
            colHeaders: true,
            manualColumnResize: true,
            manualColumnMove: true,
            startRows: 1,
            rowHeaders: true,
            currentRowClassName: 'ht-currentRow',
            minSpareRows: 1,
            outsideClickDeselects: true,
        };
    }
    DbComponent.prototype.ngOnInit = function () {
        window.scroll(0, 0);
    };
    DbComponent.prototype.ngAfterViewInit = function () {
        this.hot = new Handsontable(document.getElementById('hot'), this.conf);
        this.loadData();
    };
    DbComponent.prototype.loadData = function () {
    };
    DbComponent.prototype.selectAll = function (type) {
    };
    DbComponent.prototype.showLocaleDlg = function (type) {
    };
    DbComponent = __decorate([
        core_1.Component({
            template: "\n<style>\ninput {\n  margin: -4px -8px;\n}\nbutton {\n  padding: 4px 10px;\n}\n</style>\n<header class=\"header\">\n  <div class=\"header-title\">\n    Text Edit\n  </div>\n  <div class=\"header-left\">\n    <a class=\"btn btn-link\" routerLink=\"/home\">\n      <i class=\"glyphicon glyphicon-chevron-left\"></i>\n      Back\n    </a>\n  </div>\n  <div class=\"header-right\">\n    <a class=\"btn btn-link\" (click)=\"showLocaleDlg('add')\">\n      <i class=\"glyphicon glyphicon-plus\"></i>\n      Add Locale\n    </a>\n    <a class=\"btn btn-link\" (click)=\"showLocaleDlg('del')\">\n      <i class=\"glyphicon glyphicon-trash\"></i>\n      Remove Locale\n    </a>\n  </div>\n</header>\n\n<div id=\"content-pant\" style=\"padding: 44px 0 200px;\">\n\n  <div class=\"row\" style=\"margin: 16px 0;\">\n\n    <div class=\"col-lg-2 col-md-2 col-sm-2\">\n      <h5>Tables</h5>\n      <div class=\"list-group\">\n        <button class=\"list-group-item\" *ngFor=\"let table of tables\">{{table}}</button>\n      </div>\n    </div>\n\n    <div class=\"col-lg-10 col-md-10 col-sm-10\">\n      <div id=\"hot\"></div>\n    </div>\n\n  </div>\n\n</div>\n"
        }), 
        __metadata('design:paramtypes', [db_service_1.DbService])
    ], DbComponent);
    return DbComponent;
}());
exports.DbComponent = DbComponent;
