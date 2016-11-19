import { Component, OnInit } from '@angular/core';

import { Hero,
         HeroService } from './hero.service';

@Component({
  template: `
  <a class="btn btn-primary" style="margin: 8px; width: calc(100% - 16px); max-width: 320px;" 
    routerLink="../home">go back HOME</a>
  <h3 highlight>Hero List</h3>
  <div *ngFor='let hero of heroes | async'>
    <a routerLink="{{hero.id}}">{{hero.id}} - {{hero.name}}</a>
  </div>
`
})
export class HeroListComponent implements OnInit {
  heroes: Promise<Hero[]>;
  constructor(private heroService: HeroService) { }

  ngOnInit() {
    this.heroes = this.heroService.getHeroes();
  }
}
