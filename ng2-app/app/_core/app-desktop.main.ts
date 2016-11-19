import { platformBrowserDynamic }	from '@angular/platform-browser-dynamic'
import { enableProdMode }			from '@angular/core'

import { AppDesktopModule }			from './app-desktop.module'

console.log('desktop')
// enableProdMode();
platformBrowserDynamic().bootstrapModule(AppDesktopModule)
