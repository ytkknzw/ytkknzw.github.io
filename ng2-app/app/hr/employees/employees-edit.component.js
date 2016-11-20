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
var common_1 = require('@angular/common');
require('rxjs/add/operator/switchMap');
var app_service_1 = require('../../app-core/app.service');
var employees_service_1 = require('./employees.service');
var EmployeesEditComponent = (function () {
    function EmployeesEditComponent(route, location, empService, appSvc) {
        this.route = route;
        this.location = location;
        this.empService = empService;
        this.appSvc = appSvc;
        window.scrollTo(0, 0);
    }
    EmployeesEditComponent.prototype.goBack = function () {
        this.location.back();
    };
    EmployeesEditComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params
            .switchMap(function (params) { return _this.empService.getEmployee(params['code']); })
            .subscribe(function (employee) {
            console.log(employee);
            _this.employee = employee;
        });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], EmployeesEditComponent.prototype, "employee", void 0);
    EmployeesEditComponent = __decorate([
        core_1.Component({
            template: "\n<header class=\"header\">\n  <div class=\"header-title\">\n    Operation &raquo; Employees &raquo; someone...\n  </div>\n  <div class=\"header-left\">\n    <a class=\"btn btn-link\" (click)=\"goBack()\">\n      <i class=\"glyphicon glyphicon-chevron-left\"></i> Back\n    </a>\n  </div>\n</header>\n\n<div id=\"content-pane\" class=\"w1024\" style=\"padding: 44px 8px 1000px 8px;\">\n\n    <div>{{employee.name_first_local}}</div>\n    <div class=\"panel panel-default\">\n      <input class=\"form-control\" [(ngModel)]=\"employee.name_first_local\">\n    </div>\n\n</div>",
            providers: [app_service_1.AppService, employees_service_1.EmployeesService]
        }), 
        __metadata('design:paramtypes', [router_1.ActivatedRoute, common_1.Location, employees_service_1.EmployeesService, app_service_1.AppService])
    ], EmployeesEditComponent);
    return EmployeesEditComponent;
}());
exports.EmployeesEditComponent = EmployeesEditComponent;
