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
var forms_1 = require('@angular/forms');
var employees_component_1 = require('./employees.component');
var employees_list_component_1 = require('./employees-list.component');
var employees_detail_component_1 = require('./employees-detail.component');
var employees_edit_component_1 = require('./employees-edit.component');
var employees_service_1 = require('./employees.service');
var routes = [
    { path: '', component: employees_component_1.EmployeesComponent,
        children: [
            { path: '', component: employees_list_component_1.EmployeesListComponent },
            { path: ':code', component: employees_detail_component_1.EmployeesDetailComponent },
            { path: 'edit', component: employees_edit_component_1.EmployeesEditComponent },
            { path: 'edit/:code', component: employees_edit_component_1.EmployeesEditComponent }
        ]
    }
];
var EmployeesModule = (function () {
    function EmployeesModule() {
    }
    EmployeesModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule.forChild(routes)
            ],
            declarations: [
                employees_component_1.EmployeesComponent,
                employees_detail_component_1.EmployeesDetailComponent,
                employees_list_component_1.EmployeesListComponent,
            ],
            providers: [
                employees_service_1.EmployeesService,
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], EmployeesModule);
    return EmployeesModule;
}());
exports.EmployeesModule = EmployeesModule;
