import {NgModule}      			from '@angular/core'
import {CommonModule}  			from '@angular/common'
import {RouterModule, Routes} 	from '@angular/router'

import {DbComponent}	from './db.component'
import {DbService}    from './db.service'

const routes: Routes = [
  { path: '',   component: DbComponent }];

@NgModule({
  imports:      [ CommonModule, RouterModule.forChild(routes) ],
  declarations: [ DbComponent ],
  providers:    [ DbService ]
})
export class DbModule {}
