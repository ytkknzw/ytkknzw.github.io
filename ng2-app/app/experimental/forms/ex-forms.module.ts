import {NgModule}      			from '@angular/core'
import {CommonModule}  			from '@angular/common'
import {RouterModule, Routes} 	from '@angular/router'

import {ExFormsComponent}		from './ex-forms.component'

@NgModule({
  imports: [ 
  	CommonModule, 
  	RouterModule.forChild([
	  	{ path: '', 	component: ExFormsComponent }
	])
  ],
  declarations: [
  	ExFormsComponent
  ],
  providers: [
  ]
})
export class ExFormsModule {}
