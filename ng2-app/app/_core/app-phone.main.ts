import { platformBrowserDynamic }	from '@angular/platform-browser-dynamic'
import { enableProdMode }			from '@angular/core'

import { AppPhoneModule }			from './app-phone.module'

console.log('phone')
// enableProdMode();
platformBrowserDynamic().bootstrapModule(AppPhoneModule)
