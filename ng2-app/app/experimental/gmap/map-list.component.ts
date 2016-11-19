import { Component, OnInit, AfterViewInit } from '@angular/core';

import { Map,
         MapService }     from './map.service';

declare var $ : any

@Component({
  template: `
<header class="header" style="text-align: center;">
  Map List
</header>
<div id="content-pant" class="w1024" style="padding: 44px 0 1000px 0;">
  <a class="btn btn-primary" style="margin: 8px; width: calc(100% - 16px);" 
    routerLink="../../home">go back Home</a>
  <div *ngFor='let m of maps | async'>
    <a class="btn btn-link btn-block" style="border-bottom: solid 1px #eee" 
      routerLink="{{'../' + m.id}}">{{m.id}} - {{m.name}}</a>
  </div>
</div>
`
})
export class MapListComponent implements OnInit, AfterViewInit {
  maps: Promise<Map[]>;

  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.maps = this.mapService.getMaps();
  }

  ngAfterViewInit() {
    console.log($('h3').text())
  }
}

