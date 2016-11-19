import { platformBrowserDynamic }	from '@angular/platform-browser-dynamic'
import { enableProdMode }			from '@angular/core'

import { AppTabletModule }			from './app-tablet.module'

console.log('tablet')
// enableProdMode();
platformBrowserDynamic().bootstrapModule(AppTabletModule)
