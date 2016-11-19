import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'my-settings',
	template: '<h1>Settings Component</h1><button (click)="goBack()">Back</button>'
})
export class SettingsComponent {

  constructor(private router: Router) {}

  goBack() : void {
  	console.log('dummy goback()')
  	this.router.navigate(['/home'])
  }
}
