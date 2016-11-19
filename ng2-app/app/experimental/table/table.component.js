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
var table_service_1 = require('./table.service');
require('handsontable');
var TableComponent = (function () {
    function TableComponent(tableService) {
        this.tableService = tableService;
    }
    TableComponent.prototype.ngOnInit = function () {
        console.log($('h3').text());
        window.scroll(0, 0);
        this.tables = this.tableService.getTables();
        new Handsontable(document.getElementById('hot'), {
            data: Handsontable.helper.createSpreadsheetData(31, 15),
            colHeaders: true,
        });
        console.log('ngAfterViewInit end');
    };
    TableComponent.prototype.ngAfterViewInit = function () {
        console.log($('h3').text());
    };
    TableComponent = __decorate([
        core_1.Component({
            styleUrls: ['./app/ex-table/handsontable.full.min.css'],
            template: "\n<header class=\"header\" style=\"z-index:200;\">\n  <div class=\"header-title\">\n    Spreadsheet Table\n  </div>\n  <div class=\"header-left\">\n    <a routerLink=\"/home\">\n      <i class=\"glyphicon glyphicon-chevron-left\"></i>\n      Back\n    </a>\n  </div>\n</header>\n\n<div id=\"content-pant\" class=\"w1024\" style=\"padding: 44px 0 2000px 0;\">\n  <h3>sample text</h3>\n  <div id=\"hot\" style=\"width: 100%; height: 400px; border: solid 2px #ccc;\"></div>\n\n</div>\n"
        }), 
        __metadata('design:paramtypes', [table_service_1.TableService])
    ], TableComponent);
    return TableComponent;
}());
exports.TableComponent = TableComponent;
