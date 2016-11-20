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
var platform_browser_1 = require('@angular/platform-browser');
var forms_1 = require('@angular/forms');
var http_1 = require('@angular/http');
var app_component_1 = require('./app.component');
var home_component_1 = require('./home.component');
var login_component_1 = require('./login.component');
var settings_component_1 = require('./settings.component');
var not_found_component_1 = require('./not-found.component');
var construction_component_1 = require('./construction.component');
var app_service_1 = require('./app.service');
var appRoutes = [
    { path: 'login', component: login_component_1.LoginComponent },
    { path: 'home', component: home_component_1.HomeComponent },
    { path: 'settings', component: settings_component_1.SettingsComponent },
    { path: 'dummy', component: construction_component_1.ConstructionComponent },
    { path: 'employees', loadChildren: 'app/hr/employees/employees.module#EmployeesModule' },
    { path: 'contact', loadChildren: 'app/tuts/contact/contact.module#ContactModule' },
    { path: 'crisis', loadChildren: 'app/tuts/crisis/crisis.module#CrisisModule' },
    { path: 'heroes', loadChildren: 'app/tuts/hero/hero.module#HeroModule' },
    { path: 'svg', component: construction_component_1.ConstructionComponent },
    { path: 'calendar', component: construction_component_1.ConstructionComponent },
    { path: 'handwrite', component: construction_component_1.ConstructionComponent },
    { path: 'charts', component: construction_component_1.ConstructionComponent },
    { path: 'motion', component: construction_component_1.ConstructionComponent },
    { path: '3d-view', component: construction_component_1.ConstructionComponent },
    { path: 'ui-comps', component: construction_component_1.ConstructionComponent },
    { path: 'forms', loadChildren: 'app/experimental/forms/ex-forms.module#ExFormsModule' },
    { path: 'map', loadChildren: 'app/experimental/map/map.module#MapModule' },
    { path: 'table', loadChildren: 'app/experimental/table/table.module#TableModule' },
    { path: 'time-management', loadChildren: 'app/hr/tm/tm.module#TimeManagementModule', data: { target: 'operation' } },
    { path: 'personal/time-management', loadChildren: 'app/hr/tm/tm.module#TimeManagementModule', data: { target: 'personal' } },
    { path: 'management/time-management', loadChildren: 'app/hr/tm/tm.module#TimeManagementModule', data: { target: 'management' } },
    { path: 'text', loadChildren: 'app/admin/text/text.module#TextModule' },
    { path: 'database', loadChildren: 'app/admin/db/db.module#TextModule' },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', component: not_found_component_1.NotFoundComponent }
];
var AppTabletModule = (function () {
    function AppTabletModule() {
    }
    AppTabletModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                http_1.HttpModule,
                router_1.RouterModule.forRoot(appRoutes)
            ],
            declarations: [
                app_component_1.AppComponent,
                login_component_1.LoginComponent,
                home_component_1.HomeComponent,
                not_found_component_1.NotFoundComponent,
                settings_component_1.SettingsComponent,
                construction_component_1.ConstructionComponent,
            ],
            providers: [
                app_service_1.AppService,
            ],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppTabletModule);
    return AppTabletModule;
}());
exports.AppTabletModule = AppTabletModule;
