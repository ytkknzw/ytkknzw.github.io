import { Injectable } from '@angular/core';

export class Hero {
  constructor(public id: number, public name: string) { }
}

export class Hero1 {
  id: number
  name: string
}

const HEROES: Hero[] = [
  new Hero(11, 'Mr. Nice'),
  new Hero(12, 'Narco'),
  new Hero(13, 'Bombasto'),
  new Hero(14, 'Celeritas'),
  new Hero(15, 'Magneta'),
  new Hero(16, 'RubberMan')
];

const HEROES1: Hero1[] = [
  { id: 21, name:'Mr. Nice'},
  { id: 22, name:'Narco'},
  { id: 23, name:'Bombasto'},
  { id: 24, name:'Celeritas'},
  { id: 25, name:'Magneta'},
  { id: 26, name:'RubberMan'}
];

const FETCH_LATENCY = 10;

@Injectable()
export class HeroService {

  getHeroes() {
    return new Promise<Hero[]>(resolve => {
      setTimeout(() => { resolve(HEROES1); }, FETCH_LATENCY);
    });
  }

  getHero(id: number | string) {
    return this.getHeroes()
      .then(heroes => heroes.find(hero => hero.id === +id));
  }

}

