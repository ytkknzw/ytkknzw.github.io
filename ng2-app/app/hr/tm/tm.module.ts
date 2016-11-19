import {NgModule }            from '@angular/core'
import {RouterModule, Routes} from '@angular/router'
import {CommonModule }        from '@angular/common'
import {FormsModule }         from '@angular/forms'

import { TimeManagementComponent }       from './tm.component'
// import { HeroDetailComponent } from './hero-detail.component';
// import { HeroListComponent }   from './hero-list.component';
// import { HighlightDirective }  from './highlight.directive';
// import { TimeManagementRoutingModule }   from './tm-routing.module'

import { TimeManagementService }         from './tm.service'

const routes: Routes = [
  { path: '', component: TimeManagementComponent,
    // children: [
    //   { path: '',    component: HeroListComponent },
    //   { path: ':id', component: HeroDetailComponent }
    // ]
  }
];

@NgModule({
  imports: [
  	CommonModule,
  	FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    TimeManagementComponent,
    // HeroDetailComponent,
    // HeroListComponent,
    // HighlightDirective
  ],
  providers: [
    TimeManagementService,
  ]
})
export class TimeManagementModule { }
