import {Component, OnInit, Input} from '@angular/core'
import {ActivatedRoute, Params}   from '@angular/router';
import {Location }                from '@angular/common';
import {Router}                   from '@angular/router'

// import 'rxjs';
// import '../../rxjs-extensions'
import 'rxjs/add/operator/switchMap';

import {AppService}       from '../../_core/app.service'
import {Employee, EmployeesService} from './employees.service'

@Component({
  template: `
<header class="header">
  <div class="header-title">
    Operation &raquo; Employees &raquo; someone...
  </div>
  <div class="header-left">
    <a class="btn btn-link" (click)="goBack()">
      <i class="glyphicon glyphicon-chevron-left"></i> Back
    </a>
  </div>
</header>

<div id="content-pane" class="w1024" style="padding: 44px 8px 1000px 8px;">

    <div>{{employee.name_first_local}}</div>
    <div class="panel panel-default">
      <input class="form-control" [(ngModel)]="employee.name_first_local">
    </div>

</div>`,
  providers: [ AppService, EmployeesService ]
})
export class EmployeesDetailComponent implements OnInit {

  // target = window['__App']['getScreenType']()

  @Input() employee : Employee

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private empService: EmployeesService,
  	private appSvc: AppService) {
    window.scrollTo(0, 0)
  }

  goBack() : void {
    this.location.back()
  }

  ngOnInit() : void {
    this.route.params
      .switchMap((params: Params) => this.empService.getEmployee(params['code']))
      .subscribe(employee => {
        console.log(employee)
        this.employee = employee
      });
  }

}
