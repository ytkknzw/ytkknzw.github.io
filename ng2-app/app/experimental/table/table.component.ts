import {Component, OnInit, AfterViewInit} from '@angular/core';

import {Table, TableService}     from './table.service';

import 'handsontable'

declare var $ : any
declare var Handsontable : any

@Component({
  styleUrls: ['./app/ex-table/handsontable.full.min.css'],
  template: `
<header class="header" style="z-index:200;">
  <div class="header-title">
    Spreadsheet Table
  </div>
  <div class="header-left">
    <a routerLink="/home">
      <i class="glyphicon glyphicon-chevron-left"></i>
      Back
    </a>
  </div>
</header>

<div id="content-pant" class="w1024" style="padding: 44px 0 2000px 0;">
  <h3>sample text</h3>
  <div id="hot" style="width: 100%; height: 400px; border: solid 2px #ccc;"></div>

</div>
`
})
export class TableComponent implements OnInit, AfterViewInit {
  tables: Promise<Table[]>;

  constructor(private tableService: TableService) { }

  ngOnInit() {
    console.log($('h3').text())
    window.scroll(0,0)
    this.tables = this.tableService.getTables();

    new Handsontable(document.getElementById('hot'), {
      data: Handsontable.helper.createSpreadsheetData(31, 15),
      // rowHeaders: true,
      colHeaders: true,
      // fixedRowsTop: 2,
      // fixedColumnsLeft: 2
    });
    console.log('ngAfterViewInit end');
  }

  ngAfterViewInit() {
    console.log($('h3').text())

  }
}

