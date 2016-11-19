import {NgModule }            from '@angular/core'
import {RouterModule, Routes} from '@angular/router'
import {CommonModule }        from '@angular/common'
import {FormsModule }         from '@angular/forms'

import {EmployeesComponent}       from './employees.component'
import {EmployeesListComponent}   from './employees-list.component'
import {EmployeesDetailComponent} from './employees-detail.component'
import {EmployeesEditComponent}   from './employees-edit.component'

import {EmployeesService}     from './employees.service'

const routes: Routes = [
  { path: '', component: EmployeesComponent,
    children: [
      { path: '',          component: EmployeesListComponent },
      { path: ':code',     component: EmployeesDetailComponent },
      { path: 'edit',      component: EmployeesEditComponent },
      { path: 'edit/:code',component: EmployeesEditComponent }
    ]
  }
];

@NgModule({
  imports: [
  	CommonModule,
  	FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    EmployeesComponent,
    EmployeesDetailComponent,
    EmployeesListComponent,
  ],
  providers: [
    EmployeesService,
  ]
})
export class EmployeesModule { }
