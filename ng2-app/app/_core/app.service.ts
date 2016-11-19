import {Injectable}      from '@angular/core';
import {Headers, Http}   from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {TextData}        from './texts'
import {Menu, MenuItem}  from './app.models'

export interface Credential {
  email: string
  password: string
  remember: boolean
}

@Injectable()
export class AppService {

  public texts = TextData
  // private _locale : string
  private _jwt : string
  private _menu : Menu[] = null

  private URL = 'http://localhost/slim-app/public/index.php'

  private headers = new Headers({
    'Content-Type': 'application/json',
    // 'Authorization': 'JWT ' + localStorage.getItem('jwt')
  });

  constructor(private http: Http) {
    let locale = this.locale
    if(!locale || locale == '' || typeof locale == 'undefined') {
      let p = window['__App']['Locale'].split('-')
      locale = (typeof p == 'string' ? p : p[0])
      if(this.texts.hasOwnProperty(locale)){
        this.locale = locale
      } else {
        console.log('set default locale en')
        this.locale = 'en'
      }
    }
  }

  get locale() : string {
    return localStorage.getItem('cegb-admin.locale')
  }
  set locale(arg : string) {
    localStorage.setItem('cegb-admin.locale', arg)
  }

  get jwt() : string {
    if(!this._jwt) this._jwt = localStorage.getItem('cegb-admin.jwt')
    return this._jwt
  }
  set jwt(arg : string) {
    localStorage.setItem('cegb-admin.jwt', arg)
    this._jwt = arg
  }

  get menu() : Menu[] {
    return JSON.parse(localStorage.getItem('cegb-admin.menu'))
    // console.log('menu 1', this._menu)
    // if(!this._menu) {
    //   let menu_ = JSON.parse(localStorage.getItem('cegb-admin.menu'))
    //   console.log('menu 1', menu_)
    //   this._menu = menu_ as Menu[]
    // }
    // console.log('get menu', this._menu)
    // return this._menu
  }
  set menu(arg: Menu[]) {
    localStorage.setItem('cegb-admin.menu', JSON.stringify(arg))
  }


  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  authenticate(credential: Credential) : Promise<boolean> {
    let url = this.URL + '/authenticate'
    return this.http.post(url, credential).toPromise()
      .then(res => {
        this.jwt = res.json().jwt
        return true
      }).catch(this.handleError)
  }

  getText(pageId: string) : Object {
    return this.texts[this.locale][pageId]
  }

  getMenu() : Promise<Menu[]> {
    console.log('app service - getMenu: start')
    if(!this.menu || this.menu.length < 1) {
      let url = this.URL + '/menu'
      return this.http.get(url).toPromise()
        .then(res => {
          this.menu = res.json() as Menu[]
          return res.json() as Menu[]
        })
        .catch(this.handleError)
    } else {
      return Promise.resolve(this.menu)
    }
  }
}
