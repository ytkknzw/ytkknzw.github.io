import { Component, OnInit, AfterViewInit } from '@angular/core';

import { Crisis,
         CrisisService }     from './crisis.service';

declare var $ : any

@Component({
  template: `
    <h3 highlight>Crisis List</h3>
    <div *ngFor='let crisis of crisises | async'>
      <a routerLink="{{'../' + crisis.id}}">{{crisis.id}} - {{crisis.name}}</a>
    </div>
  `
})
export class CrisisListComponent implements OnInit, AfterViewInit {
  crisises: Promise<Crisis[]>;

  constructor(private crisisService: CrisisService) { }

  ngOnInit() {
    this.crisises = this.crisisService.getCrises();
  }

  ngAfterViewInit() {
  }
}

