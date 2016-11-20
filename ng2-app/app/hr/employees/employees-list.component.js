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
var common_1 = require('@angular/common');
var app_service_1 = require('../../app-core/app.service');
var employees_service_1 = require('./employees.service');
var EmployeesListComponent = (function () {
    function EmployeesListComponent(location, empService, appSvc) {
        this.location = location;
        this.empService = empService;
        this.appSvc = appSvc;
        this.target = window['__App']['getScreenType']();
        window.scrollTo(0, 0);
    }
    EmployeesListComponent.prototype.goBack = function () {
        this.location.back();
    };
    EmployeesListComponent.prototype.ngOnInit = function () {
    };
    EmployeesListComponent.prototype.ngAfterViewInit = function () {
        if (this.target == 'desktop') {
            this.initDesktop();
        }
    };
    EmployeesListComponent.prototype.initDesktop = function () {
        var _this = this;
        var conf = {
            colHeaders: [
                '会社名', '従業員番号', '形態', '姓', '名', '他', '姓(英)', '名(英)', '他(英)',
                '姓(読み)', '名(読み)', '他(読み)', '性別', '誕生日', '国籍', 'メールアドレス', '残業時間上限', ''],
            columns: [
                { data: 'company_code', readOnly: true },
                { data: 'employee_code', readOnly: true },
                { data: 'employee_type_code', readOnly: true },
                { data: 'name_last_local' },
                { data: 'name_first_local' },
                { data: 'name_other_local' },
                { data: 'name_last_en' },
                { data: 'name_first_en' },
                { data: 'name_other_en' },
                { data: 'name_last_phonetic' },
                { data: 'name_first_phonetic' },
                { data: 'name_other_phonetic' },
                { data: 'sexuality', type: 'dropdown', source: ['M', 'F'] },
                { data: 'date_of_birth', type: 'date', format: 'yyyy-MM-dd' },
                { data: 'nationalities' },
                { data: 'email' },
                { data: 'limit_over_time', type: 'numeric' },
                { width: 300, header: 'aAA' }
            ],
            height: 500,
            fixedColumnsLeft: 6,
            columnSorting: true,
            sortIndicator: true,
            disableVisualSelection: 'area',
            fillHandle: false,
            wordWrap: false,
            trimWhitespace: true,
            manualColumnResize: true,
            rowHeaders: true,
        };
        var el = document.getElementById('hot_emp');
        this.hot = new Handsontable(el, conf);
        console.log('new hot');
        this.empService.getEmployees()
            .then(function (dat) {
            _this.employees = dat;
            _this.hot.loadData(dat);
        })
            .catch(function (err) { return alert(err); });
    };
    EmployeesListComponent = __decorate([
        core_1.Component({
            template: "\n<style>\ntd, th {\n  border: solid 1px #ddd;\n}\nth {\n  background-color: #eee;\n}\n</style>\n<header class=\"header\" style=\"text-align: center;\">\n  <div class=\"header-title\">\n    Operation &raquo; Employees\n  </div>\n  <div class=\"header-left\">\n    <a class=\"btn btn-link\" (click)=\"goBack()\">\n      <i class=\"glyphicon glyphicon-chevron-left\"></i> Back\n    </a>\n  </div>\n</header>\n\n<div id=\"content-pane\" class=\"\" style=\"padding: 44px 0 0 0;\">\n\n  <a class=\"btn btn-primary\" routerLink=\"./046\">Detail</a>\n  <a class=\"btn btn-primary\" routerLink=\"./new\">New</a>\n\n  <div *ngIf=\"target=='desktop'\" id=\"hot_emp\" style=\"margin: 50px 0 0 0;\"></div>\n\n  <table *ngIf=\"target=='tablet'\">\n    <thead>\n      <tr>\n        <th></th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td></td>\n      </tr>\n    </tbody>\n  </table>\n\n</div>",
            providers: [app_service_1.AppService, employees_service_1.EmployeesService]
        }), 
        __metadata('design:paramtypes', [common_1.Location, employees_service_1.EmployeesService, app_service_1.AppService])
    ], EmployeesListComponent);
    return EmployeesListComponent;
}());
exports.EmployeesListComponent = EmployeesListComponent;
