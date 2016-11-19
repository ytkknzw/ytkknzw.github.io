import {Component, OnInit, AfterViewInit} from '@angular/core';

import {TableMetadata, DbService}     from './db.service';

declare var Handsontable: any

@Component({
  template: `
<style>
input {
  margin: -4px -8px;
}
button {
  padding: 4px 10px;
}
</style>
<header class="header">
  <div class="header-title">
    Text Edit
  </div>
  <div class="header-left">
    <a class="btn btn-link" routerLink="/home">
      <i class="glyphicon glyphicon-chevron-left"></i>
      Back
    </a>
  </div>
  <div class="header-right">
    <a class="btn btn-link" (click)="showLocaleDlg('add')">
      <i class="glyphicon glyphicon-plus"></i>
      Add Locale
    </a>
    <a class="btn btn-link" (click)="showLocaleDlg('del')">
      <i class="glyphicon glyphicon-trash"></i>
      Remove Locale
    </a>
  </div>
</header>

<div id="content-pant" style="padding: 44px 0 200px;">

  <div class="row" style="margin: 16px 0;">

    <div class="col-lg-2 col-md-2 col-sm-2">
      <h5>Tables</h5>
      <div class="list-group">
        <button class="list-group-item" *ngFor="let table of tables">{{table}}</button>
      </div>
    </div>

    <div class="col-lg-10 col-md-10 col-sm-10">
      <div id="hot"></div>
    </div>

  </div>

</div>
`
})
export class DbComponent implements OnInit, AfterViewInit {
  type = window['__App']['getScreenType']()

  tables : any[]
  metadata : TableMetadata[]
  data : any

  hot: any
  conf = {
    startCols: 4,
    colHeaders: true,
    // columns: [
    //   { data: 'page' },
    //   { data: 'key' },
    //   { data: 'en' },
    //   { data: 'ja' },
    // ],
    manualColumnResize: true,
    manualColumnMove: true,

    startRows: 1,
    // rowHeights: 32,
    rowHeaders: true,
    currentRowClassName: 'ht-currentRow',
    minSpareRows: 1,

    outsideClickDeselects: true,
    // className: 'ht-m',
  }

  constructor(private dbService: DbService) { }

  ngOnInit() {
    window.scroll(0,0)
  }

  ngAfterViewInit() {
    this.hot = new Handsontable(document.getElementById('hot'), this.conf)
    this.loadData()
  }

  loadData() : void {
    // let val_l = document.getElementById('sel_locale').value
    // let val_p = document.getElementById('sel_page').value
    // console.log(val_l, val_p)
    // this.textService.select2()
    //   .then(dat => {
    //     console.log('data', dat)
    //     this.texts = dat
    //     this.hot.loadData(dat)
    //     this.hot.selectCell(0,0)
    //   })
    //   .catch(() => alert())
  }

  selectAll(type: string) : void {

  }

  showLocaleDlg(type: string) {

  }
}

