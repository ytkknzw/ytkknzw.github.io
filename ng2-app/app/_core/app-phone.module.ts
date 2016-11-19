import {NgModule}              from '@angular/core'
import {RouterModule, Routes}  from '@angular/router'
import {BrowserModule}         from '@angular/platform-browser'
import {FormsModule}           from '@angular/forms'
import {HttpModule}            from '@angular/http'

// import '../rxjs-extensions'

import {AppComponent}          from './app.component'
import {HomeComponent}         from './home.component'
import {LoginComponent}        from './login.component'
import {SettingsComponent}     from './settings.component'
import {NotFoundComponent}     from './not-found.component'
import {DummyComponent}        from './dummy.component'
import {ConstructionComponent} from './construction.component'

import {AppService}        from './app.service'

const appRoutes: Routes = [
  { path: 'login',    component: LoginComponent },
  { path: 'home',     component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'dummy',    component: DummyComponent },

  { path: 'employees',loadChildren: 'app/hr/employees/employees.module#EmployeesModule' },

  { path: 'contact',  loadChildren: 'app/tuts/contact/contact.module#ContactModule' },
  { path: 'crisis',   loadChildren: 'app/tuts/crisis/crisis.module#CrisisModule' },
  { path: 'heroes',   loadChildren: 'app/tuts/hero/hero.module#HeroModule' },

  { path: 'svg',      component: ConstructionComponent },
  { path: 'calendar', component: ConstructionComponent },
  { path: 'handwrite',component: ConstructionComponent },
  { path: 'charts',   component: ConstructionComponent },
  { path: 'motion',   component: ConstructionComponent },
  { path: '3d-view',  component: ConstructionComponent },
  { path: 'ui-comps', component: ConstructionComponent },

  { path: 'forms',    loadChildren: 'app/experimental/forms/ex-forms.module#ExFormsModule' },
  { path: 'map',      loadChildren: 'app/experimental/map/map.module#MapModule' },
  { path: 'table',    loadChildren: 'app/experimental/table/table.module#TableModule' },

  { path: 'time-management',            loadChildren: 'app/hr/tm/tm.module#TimeManagementModule', data: { target: 'operation'} },
  { path: 'personal/time-management',   loadChildren: 'app/hr/tm/tm.module#TimeManagementModule', data: { target: 'personal'} },
  { path: 'management/time-management', loadChildren: 'app/hr/tm/tm.module#TimeManagementModule', data: { target: 'management'} },

  { path: 'text',     loadChildren: 'app/admin/text/text.module#TextModule' },
  { path: 'database', loadChildren: 'app/admin/db/db.module#TextModule' },

  { path: '',  redirectTo: 'home',  pathMatch: 'full' },
  { path: '**',        component: NotFoundComponent}
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    NotFoundComponent,
    SettingsComponent,
    DummyComponent,
    ConstructionComponent,
  ],
  providers: [
    AppService,
  ],
  bootstrap: [ AppComponent ]
})
export class AppPhoneModule {}
