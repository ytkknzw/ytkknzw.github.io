import { Component }   from '@angular/core';

import { HeroService } from './hero.service';
import { TutorialService } from '../tuts.service';

@Component({
  template: `
<header class="header" style="text-align: center;">
  Heroes of {{userName}}
</header>
<div id="content-pant" class="w1024" style="padding: 44px 8px 1000px 8px;">
    <router-outlet></router-outlet>
</div>`,
  providers: [ HeroService ]
})
export class HeroComponent {
  userName = '';
  constructor(tutsService: TutorialService) {
    this.userName = tutsService.userName
  }
}
