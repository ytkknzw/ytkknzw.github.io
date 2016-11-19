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
var map_list_component_1 = require('./map-list.component');
var map_detail_component_1 = require('./map-detail.component');
var map_service_1 = require('./map.service');
var map_routing_module_1 = require('./map-routing.module');
var MapModule = (function () {
    function MapModule() {
    }
    MapModule = __decorate([
        core_1.NgModule({
            imports: [common_1.CommonModule, map_routing_module_1.MapRoutingModule],
            declarations: [map_detail_component_1.MapDetailComponent, map_list_component_1.MapListComponent],
            providers: [map_service_1.MapService]
        }), 
        __metadata('design:paramtypes', [])
    ], MapModule);
    return MapModule;
}());
exports.MapModule = MapModule;
