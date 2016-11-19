import {Component, OnInit, AfterViewInit, Input }   from '@angular/core'
import {Router}       from '@angular/router'
import {Location }    from '@angular/common';

import {AppService}   from '../../_core/app.service'
import {Employee, EmployeesService} from './employees.service'

declare var Handsontable : any

@Component({
  template: `
<style>
td, th {
  border: solid 1px #ddd;
}
th {
  background-color: #eee;
}
</style>
<header class="header" style="text-align: center;">
  <div class="header-title">
    Operation &raquo; Employees
  </div>
  <div class="header-left">
    <a class="btn btn-link" (click)="goBack()">
      <i class="glyphicon glyphicon-chevron-left"></i> Back
    </a>
  </div>
</header>

<div id="content-pane" class="" style="padding: 44px 0 0 0;">

  <a class="btn btn-primary" routerLink="./046">Detail</a>
  <a class="btn btn-primary" routerLink="./new">New</a>

  <div *ngIf="target=='desktop'" id="hot_emp" style="margin: 50px 0 0 0;"></div>

  <table *ngIf="target=='tablet'">
    <thead>
      <tr>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td></td>
      </tr>
    </tbody>
  </table>

</div>`,
  providers: [ AppService, EmployeesService ]
})
export class EmployeesListComponent implements OnInit, AfterViewInit {

  target = window['__App']['getScreenType']()

  employees : Employee[]

  hot : any

  constructor(
    private location: Location,
    private empService: EmployeesService,
  	private appSvc: AppService) {
    window.scrollTo(0, 0)
  }

  goBack() : void {
    this.location.back()
  }

  ngOnInit() : void {
  }

  ngAfterViewInit() : void {
    if(this.target == 'desktop'){
      this.initDesktop()
    }
  }

  private initDesktop() : void {
    let conf = {
      colHeaders: [
        '会社名', '従業員番号', '形態', '姓', '名', '他', '姓(英)', '名(英)', '他(英)',
         '姓(読み)', '名(読み)', '他(読み)', '性別', '誕生日', '国籍','メールアドレス', '残業時間上限', ''],
      columns: [
        { data: 'company_code', readOnly: true },
        { data: 'employee_code', readOnly: true },
        { data: 'employee_type_code', readOnly: true },
        { data: 'name_last_local' },
        { data: 'name_first_local' },
        { data: 'name_other_local' },
        { data: 'name_last_en' },
        { data: 'name_first_en' },
        { data: 'name_other_en' },
        { data: 'name_last_phonetic' },
        { data: 'name_first_phonetic' },
        { data: 'name_other_phonetic' },
        { data: 'sexuality', type: 'dropdown', source: ['M', 'F'] },
        { data: 'date_of_birth', type: 'date', format:'yyyy-MM-dd' },
        { data: 'nationalities' },
        { data: 'email' },
        { data: 'limit_over_time', type: 'numeric' },
        { width: 300, header: 'aAA' }
      ],
      height: 500,
      fixedColumnsLeft: 6,
      columnSorting: true,
      sortIndicator: true,
      disableVisualSelection: 'area',
      fillHandle: false,
      wordWrap: false,
      trimWhitespace: true,
      // manualColumnMove: true,
      // manualRowMove: true,
      manualColumnResize: true,
      // manualRowResize: true,
      rowHeaders: true,
    }
    let el = document.getElementById('hot_emp')
    this.hot = new Handsontable(el, conf)
    console.log('new hot')
    // this.employees = 
    this.empService.getEmployees()
      .then(dat => {
        this.employees = dat
        this.hot.loadData(dat)
      })
      .catch(err => alert(err))
  }

}
