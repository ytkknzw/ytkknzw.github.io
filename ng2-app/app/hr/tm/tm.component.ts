import {Component, OnInit, Input }   from '@angular/core';
import {Router, Params} from '@angular/router'

import {TimeManagementService } from './tm.service';
import {AppService}            from '../../_core/app.service';

@Component({
  template: `
<style>
th, td {
  border: solid 1px #ddd;
  padding: 4px 8px;
  min-width: 100px;
}
</style>
<header *ngIf="target=='desktop'" class="header" style="text-align: center;">
  <div class="header-title">
    Desktop &raquo; Time Management &raquo; {{userName}}
  </div>
</header>
<header *ngIf="target=='tablet'" class="header" style="text-align: center;">
  <div class="header-title">
    Tablet &raquo; Time Management &raquo; {{userName}}
  </div>
</header>
<header *ngIf="target=='phone'" class="header" style="text-align: center;">
  <div class="header-title">
    Time Management
  </div>
</header>
<div id="content-pane" class="w1024" style="padding: 44px 8px 1000px 8px;">
	<a class="btn btn-primary" routerLink="/home">Go Back</a>

  <table>
    <thead>
      <tr>
        <th>Vin</th>
        <th>Year</th>
        <th>Brand</th>
        <th>Color</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>

</div>`,
  providers: [TimeManagementService]
})
export class TimeManagementComponent implements OnInit {

  target = window['__App']['getScreenType']()

  private userName = 'Yutaka Kanazawa';

  constructor(
  	private tmSvc: TimeManagementService,
  	private appSvc: AppService) {
    window.scrollTo(0, 0)
  }

  ngOnInit() : void {
  }

}
