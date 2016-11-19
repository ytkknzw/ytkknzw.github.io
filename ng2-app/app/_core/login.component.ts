import {Component, OnInit, Input} from '@angular/core'
import {Router} from '@angular/router'

import {AppService, Credential}   from './app.service'
import {Text, Locale} from './app.models'

declare var $ : any


@Component({
	template: `
<div style="padding: 0; margin: 0 auto; width: 300px;">
  <h1 style="text-align: center;"><span style="font-weight: 200;">CEGB</span> <b>Admin</b></h1>
  <br/>
  <div class="form-group">
    <!-- <label for="account">Account</label> -->
    <input id="account" class="form-control" type="text" 
      placeholder="{{texts.account}}" [(ngModel)]="credential.email">
  </div>
  <div class="form-group">
    <!-- <label for="password">Password</label> -->
    <input id="password" class="form-control" type="password" 
      placeholder="{{texts.password}}" [(ngModel)]="credential.password">
  </div>
  <div class="form-group checkbox">
    <label>
      <input type="checkbox" [(ngModel)]="credential.remember"> {{texts.remember_me}}
    </label>
  </div>
  <br/>
  <div class="form-group">
    <button id="btn_login" class="btn btn-primary btn-block" (click)="login()">{{texts.login}}</button>
  </div>
  <div class="form-group">
    <label for="language">{{texts.language}}</label>
    <select id="language" class="form-control" [(ngModel)]="selectedLocale" (ngModelChange)="changeLocale()">
      <option *ngFor="let locale of locales" value="{{locale.key}}">{{locale.name}}</option>
    </select>
  </div>
  <br/>
  <a href="#">{{texts.register}}</a> &nbsp;| &nbsp;<a href="#">{{texts.forgot}}</a>
</div>
`
})
export class LoginComponent implements OnInit {

  texts = {}
  credential: Credential = {
      email : '',
      password : '',
      remember : false
    }
  // email: string
  // password: string
  // remember: boolean

	locales : Locale[] = [
		{ key: 'en', name: 'English'},
		{ key: 'ja', name: '日本語'}]
  selectedLocale = 'en'

  constructor(
    private router: Router, 
  	private appService: AppService) {
    console.log('Login Const')
    this.selectedLocale = this.appService.locale
    this.texts = this.appService.getText('login')
  }

  ngOnInit() : void {
    if(this.appService.jwt) {
      this.appService.jwt = ''
    }
  }

  // changeLocale(evt: Event) : void {
  changeLocale() : void {
  	this.appService.locale = this.selectedLocale
    this.texts = this.appService.getText('login')
  }

  login() : void {
    console.log('login comp - login: start')
    this.appService.authenticate(this.credential)
  		.then(b => this.router.navigate(['/home']))
      .catch(err => alert(err))
  }
}
