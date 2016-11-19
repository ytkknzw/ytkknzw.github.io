import {NgModule}      			from '@angular/core'
import {CommonModule}  			from '@angular/common'
import {RouterModule, Routes} 	from '@angular/router'

import {TableComponent}	 from './table.component'
import {TableService}    from './table.service'

import 'handsontable'

const routes: Routes = [
  { path: '', 		component: TableComponent}];

@NgModule({
  imports:      [ CommonModule, RouterModule.forChild(routes) ],
  declarations: [ TableComponent, ],
  providers:    [ TableService ]
})
export class TableModule {}
