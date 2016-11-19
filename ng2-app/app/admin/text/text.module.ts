import {NgModule}      			from '@angular/core'
import {CommonModule}  			from '@angular/common'
import {RouterModule, Routes} 	from '@angular/router'

import {TextComponent}	from './text.component'
import {TextService}    from './text.service'

const routes: Routes = [
  { path: '', 		redirectTo: 'list', pathMatch: 'full'},
  { path: 'list',   component: TextComponent }];

@NgModule({
  imports:      [ CommonModule, RouterModule.forChild(routes) ],
  declarations: [ TextComponent ],
  providers:    [ TextService ]
})
export class TextModule {}
