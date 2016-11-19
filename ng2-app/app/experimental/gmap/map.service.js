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
var Map = (function () {
    function Map(id, name) {
        this.id = id;
        this.name = name;
    }
    return Map;
}());
exports.Map = Map;
var MAPS = [
    new Map(1, 'Dragon Burning Cities'),
    new Map(2, 'Sky Rains Great White Sharks'),
    new Map(3, 'Giant Asteroid Heading For Earth'),
    new Map(4, 'Procrastinators Meeting Delayed Again'),
];
var FETCH_LATENCY = 100;
var MapService = (function () {
    function MapService() {
    }
    MapService.prototype.getMaps = function () {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(MAPS);
            }, FETCH_LATENCY);
        });
    };
    MapService.prototype.getMap = function (id) {
        return this.getMaps().then(function (maps) { return maps.find(function (map) { return map.id === +id; }); });
    };
    MapService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MapService);
    return MapService;
}());
exports.MapService = MapService;
