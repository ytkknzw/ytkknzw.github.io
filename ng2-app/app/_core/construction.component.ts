import { Component } from '@angular/core';


@Component({
	template: `
<header class="header">
  <div class="header-title">
    <i class="glyphicon glyphicon-home"></i>
     Under Construction... Coming Soon... Hopefuly...
  </div>
  <div class="header-left">
    <a routerLink="/home">
      <i class="glyphicon glyphicon-chevron-left"></i>
      <span class="hidden-xs"> Back</span>
    </a>
  </div>
</header>

<div id="content-pane" class="w1024" style="padding: 44px 8px 1000px 8px; text-align: center;">
  <h1>Under Construction</h1>
  <hr/>
  <p>Coming Soon... Hopefuly...</p>
</div>
`
})
export class ConstructionComponent {

  // constructor(private router: Router) {
  constructor() {
  	window.scrollTo(0, 0);
  }
}
