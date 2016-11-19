import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }    from '@angular/router';

@Component({
  template: `
<header class="header" style="text-align: center;">
  Map Detail
</header>
<div id="content-pant" class="w1024" style="padding: 44px 0 100px 0;">
  <div>Map id: {{id}}</div>
  <br>
  <a routerLink="../list">Map List</a>
</div>
`
})
export class MapDetailComponent implements OnInit {
  id: number;
  constructor(private route: ActivatedRoute) {  }

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.params['id'], 10);
  }
}
