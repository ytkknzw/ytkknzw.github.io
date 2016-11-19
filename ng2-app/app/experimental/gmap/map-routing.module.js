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
var map_list_component_1 = require('./map-list.component');
var map_detail_component_1 = require('./map-detail.component');
var routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: map_list_component_1.MapListComponent },
    { path: ':id', component: map_detail_component_1.MapDetailComponent }];
var MapRoutingModule = (function () {
    function MapRoutingModule() {
    }
    MapRoutingModule = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forChild(routes)],
            exports: [router_1.RouterModule]
        }), 
        __metadata('design:paramtypes', [])
    ], MapRoutingModule);
    return MapRoutingModule;
}());
exports.MapRoutingModule = MapRoutingModule;
