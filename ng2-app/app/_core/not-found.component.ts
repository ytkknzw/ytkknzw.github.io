import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'my-notfound',
	template: `
<header class="header">
  <div class="header-title" style="font-size: 20px;">
    CEGB <b>Admin</b>
  </div>
  <div class="header-left">
    <a routerLink="/home">Back</a>
  </div>
</header>

<div id="content-pant" class="w1024" style="padding: 44px 8px 1000px 8px; text-align: center;">
	<h1>Page Not Found</h1>
	<button class="btn btn-primary" (click)="goBack()">Back</button>
</div>`
})
export class NotFoundComponent implements OnInit {

  constructor(private router: Router) {}

  goBack() : void {
  	console.log('dummy goback()')
  	this.router.navigate(['/home'])
  }

  ngOnInit() : void {
    window.scroll(0, 0)
  }
}
