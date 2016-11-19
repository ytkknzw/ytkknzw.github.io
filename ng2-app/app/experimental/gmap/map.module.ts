import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { MapListComponent }    from './map-list.component';
import { MapDetailComponent }  from './map-detail.component';
import { MapService }          from './map.service';
import { MapRoutingModule }    from './map-routing.module';

@NgModule({
  imports:      [ CommonModule, MapRoutingModule ],
  declarations: [ MapDetailComponent, MapListComponent ],
  providers:    [ MapService ]
})
export class MapModule {}
