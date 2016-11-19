import { Injectable } from '@angular/core';

export class Map {
  constructor(public id: number, public name: string) { }
}

const MAPS: Map[] = [
  new Map(1, 'Dragon Burning Cities'),
  new Map(2, 'Sky Rains Great White Sharks'),
  new Map(3, 'Giant Asteroid Heading For Earth'),
  new Map(4, 'Procrastinators Meeting Delayed Again'),
];

const FETCH_LATENCY = 100;

@Injectable()
export class MapService {

  getMaps() {
    return new Promise<Map[]>(resolve => {
      setTimeout(() => {
        resolve(MAPS);
      }, FETCH_LATENCY);
    });
  }

  getMap(id: number | string) {
    return this.getMaps().then(maps => maps.find(map => map.id === +id));
  }

}

