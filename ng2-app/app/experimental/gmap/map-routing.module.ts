import { NgModule }            from '@angular/core';
import { Routes,
         RouterModule }        from '@angular/router';

import { MapListComponent }    from './map-list.component';
import { MapDetailComponent }  from './map-detail.component';

const routes: Routes = [
  { path: '', 		redirectTo: 'list', pathMatch: 'full'},
  { path: 'list',   component: MapListComponent },
  { path: ':id', 	component: MapDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapRoutingModule {}

