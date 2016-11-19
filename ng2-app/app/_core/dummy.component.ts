import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
	template: `
<header class="header">
  <div class="header-title">
    <span class="hidden-xs">
      <i class="glyphicon glyphicon-home"></i>
      Home &raquo; Operation &raquo; 
      Time Management
    </span>
    &nbsp;
  </div>
  <div class="header-left">
    <a routerLink="/home">
      <i class="glyphicon glyphicon-chevron-left"></i>
      <span class="hidden-xs"> Back</span>
    </a>
      Time Management
  </div>
  <div class="header-right">
    <a href="#">
      <i class="glyphicon glyphicon-menu-hamburger"></i>
      <span class="hidden-xs"> Options</span>
    </a>
    <a href="#">
      <i class="glyphicon glyphicon-option-vertical"></i>
      <span class="hidden-xs"> Actions</span>
    </a>
  </div>
</header>

<div id="content-pane" class="w1024" style="padding: 44px 8px 1000px 8px; text-align: center;">
  <h1>Dummy Page Component</h1>
  <h1>type:{{type}} (w:{{width}} h:{{height}})</h1>
  <button class="btn btn-primary" (click)="goBack()">Back</button>
  <hr/>
  <div *ngIf="type=='desktop'" class="well">desktop</div>
  <div *ngIf="type=='tablet'" class="well">tablet</div>
  <div *ngIf="type=='phone'" class="well">phone</div>
  <hr/>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt, 
  accusantium quod. Quo accusantium cumque, quis culpa magni, voluptas 
  reiciendis rem excepturi error sint inventore deserunt similique, 
  eligendi suscipit reprehenderit blanditiis.</p>
</div>
`
})
export class DummyComponent {

  private width  = window['__App']['getWidth']()
  private height = window['__App']['getHeight']()
  private type   = window['__App']['getScreenType']()

  constructor(private router: Router) {
  	window.scrollTo(0, 0);
  }

  goBack() : void {
  	console.log('dummy goback()')
  	this.router.navigate(['/home'])
  }
}
