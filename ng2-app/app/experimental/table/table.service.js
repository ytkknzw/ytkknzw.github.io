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
var TEXTS = [
    { 'id': 1, 'name': 'Dragon Burning Cities' },
    { 'id': 2, 'name': 'Sky Rains Great White Sharks' },
    { 'id': 3, 'name': 'Giant Asteroid Heading For Earth' },
    { 'id': 4, 'name': 'Procrastinators Meeting Delayed Again' },
];
var FETCH_LATENCY = 100;
var TableService = (function () {
    function TableService() {
    }
    TableService.prototype.getTables = function () {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(TEXTS);
            }, FETCH_LATENCY);
        });
    };
    TableService.prototype.getTable = function (id) {
        return this.getTables().then(function (tables) { return tables.find(function (table) { return table.id === +id; }); });
    };
    TableService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], TableService);
    return TableService;
}());
exports.TableService = TableService;
