import {Component, OnInit} from '@angular/core'
import {Router}            from '@angular/router'

import {AppService} from './app.service'
import {Menu}       from './app.models'

@Component({
	template: `
<header class="header">
  <div class="header-title" style="font-size: 20px;">
    CEGB <b>Admin</b>
  </div>
</header>

<div id="content-pant" class="w1024" style="padding: 44px 0 100px 0;">
  <div class="menu">
    <img id="img-user" src="../assets/img/square_male.png"> y.kanazawa@cegb.co.jp
    <span class="pull-right">
      <a class="btn btn-default" routerLink="settings" style="margin: 0 8px;">
        <i class="glyphicon glyphicon-cog"></i> {{texts.settings}}
      </a>
      <a class="btn btn-primary" (click)="showLogoffDlg()">
        <i class="glyphicon glyphicon-off"></i> {{texts.logout}}
      </a>
    </span>
    <div style="clear: both;"></div>
  </div>
  <div class="menu" *ngFor="let menu of menues | async">
    <span class="menu-title">{{text(menu.key)}}</span>
    <span class="menu-desc">{{menu.description}}</span>
    <div class="row">
      <div class="col-md-3 col-sm-4" *ngFor="let item of menu.items">
        <a class="menu-item" routerLink="../{{item.route}}">
          <i class="glyphicon glyphicon-chevron-right"></i>
          <span class="menu-item-title">{{text(item.key)}}</span>
        </a>
      </div>
    </div>
  </div>
</div>
`
})
export class HomeComponent implements OnInit {

  // texts : Promise<{}>
  texts = {}
  type = window['__App']['getScreenType']()
  menues: Promise<Menu[]>

  constructor(
  	private router: Router, 
  	private appService : AppService){
  	if(this.appService.jwt == ''){
  		this.router.navigate(['/login'])
  	}
    this.texts = this.appService.getText('home')
  }

  ngOnInit() {
  	this.menues = this.appService.getMenu()
  }

  text(key: string) : string {
  	return this.texts[key] || key
  }

  showLogoffDlg() {
  	if(confirm('are you sure?')){
  		this.logout()
  	}
  }

  logout() {
  	this.appService.jwt = ''
  	this.appService.menu = []
  	this.router.navigate(['/login'])
  }
}
