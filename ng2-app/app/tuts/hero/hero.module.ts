import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';

import { HeroComponent }       from './hero.component';
import { HeroDetailComponent } from './hero-detail.component';
import { HeroListComponent }   from './hero-list.component';
import { HighlightDirective }  from './highlight.directive';
import { HeroRoutingModule }   from './hero-routing.module';

import { TutorialService }     from '../tuts.service'
import { HeroService }         from './hero.service'

@NgModule({
  imports: [
  	CommonModule,
  	FormsModule,
  	HeroRoutingModule
  ],
  declarations: [
    HeroComponent,
    HeroDetailComponent,
    HeroListComponent,
    HighlightDirective
  ],
  providers: [
    TutorialService,
    HeroService,
  ]
})
export class HeroModule { }
