import { Injectable }    from '@angular/core'
import { Headers, Http } from '@angular/http'

import { Hero } from './tuts.models'

// import 'rxjs'
// import '../rxjs-extensions'
import 'rxjs/add/operator/toPromise'

@Injectable()
export class TutorialService {

  userName = 'sharlock homes'

  private URL = 'http://localhost/slim-app/public/index.php/hero'

  private headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': 'JWT ' + localStorage.getItem('jwt')
  });

  constructor(private http: Http) {}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  public getHeroes() : Promise<Hero[]> {
    return this.http.get(this.URL).toPromise()
      .then(dat => dat.json())
      .catch(err => this.handleError(err))
  }
}
