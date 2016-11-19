import {Component, OnInit, AfterViewInit} from '@angular/core';

import {Text, TextService}     from './text.service';

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
      <button class="btn btn-primary btn-block" (click)="loadData()">Load Data</button>
      <h5>Locale</h5>
      <select class="form-control" id="sel_locale">
        <option *ngFor="let locale of locales" value="{{locale}}">{{locale}}</option>
        <option value="all">All</option>
      </select>
      <h5>Page</h5>
      <div class="list-group">
        <button class="list-group-item" (click)="selectAll('page')">All</button>
        <button class="list-group-item" *ngFor="let page of pages">{{page}}</button>
      </div>
      <select class="form-control" id="sel_page">
        <option *ngFor="let page of pages" value="{{page}}">{{page}}</option>
        <option value="all">All</option>
      </select>
    </div>

    <div class="col-lg-10 col-md-10 col-sm-10">
      <div class="btn-toolbar">
        <div class="btn-group">
          <button class="btn btn-default active"><b>All Locales</b></button>
          <button class="btn btn-default" style="min-width: 60px;">en</button>
          <button class="btn btn-default" style="min-width: 60px;">ja</button>
          <button class="btn btn-default" style="min-width: 60px;">hans-s</button>
          <button class="btn btn-default" style="min-width: 60px;">hans-t</button>
          <button class="btn btn-default" style="min-width: 60px;">ko</button>
          <button class="btn btn-default" style="min-width: 60px;">fr</button>
          <button class="btn btn-default" style="min-width: 60px;">es</button>
          <button class="btn btn-default" style="min-width: 60px;">ru</button>
        </div>
        <div class="btn-group">
          <button class="btn btn-info">
            <i class="glyphicon glyphicon-plus"></i>
            Add
          </button>
          <button class="btn btn-danger">
            <i class="glyphicon glyphicon-plus"></i>
            Delete
          </button>
        </div>
      </div>
      <br/>

      <div id="hot"></div>

      <h4>text 2</h4>
      <div id="hot2"></div>
    </div>

  </div>

</div>
`
})
export class TextComponent implements OnInit, AfterViewInit {
  type = window['__App']['getScreenType']()

  sels : any
  locales = ['en', 'ja', 'han-t', 'han-s', 'ko', 'fr', 'es', 'ru']
  pages = ['login', 'home']
  texts: Text[]

  hot: any
  conf = {
    startCols: 4,
    colHeaders: ['Page', 'Key', 'en', 'ja'],
    columns: [
      { data: 'page' },
      { data: 'key' },
      { data: 'en' },
      { data: 'ja' },
    ],
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

  constructor(private textService: TextService) { }

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

